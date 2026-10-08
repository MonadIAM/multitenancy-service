import { ChangeSetType } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import { sql } from "kysely";

import { DepartmentClosure } from "~context/domain/entities";
import { ExceptionMapper } from "~common/exceptions";
import { kysely } from "~infrastructure/database";
import { TrackedWrites } from "~common/mixins";

const CLOSURE_COLUMNS = ["organization_id", "ancestor_id", "descendant_id", "depth"] as const;

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentClosureRepository
    extends TrackedWrites<Entities.DepartmentClosure>({ Entity: DepartmentClosure })
    implements Repositories.DepartmentClosure.Contract
{
    private readonly resource = DepartmentClosure.name;

    public async insertNewHierarchy(
        props: Repositories.DepartmentClosure.InsertNewHierarchy.Props,
    ): Repositories.DepartmentClosure.InsertNewHierarchy.Result {
        try {
            const { transaction, descendant, ancestor, organization } = props;

            // NOTE[SQL-01]: see NOTES.md#SQL-01
            const query = kysely
                .insertInto("organization.department_closure")
                .columns(CLOSURE_COLUMNS)
                .expression(
                    kysely
                        .selectFrom("organization.department_closure as closure")
                        .select([
                            sql<string>`${organization}::uuid`.as("organization_id"),
                            "closure.ancestor_id",
                            sql<string>`${descendant}::uuid`.as("descendant_id"),
                            sql<number>`closure.depth + 1`.as("depth"),
                        ])
                        .where("closure.descendant_id", "=", sql<string>`${ancestor ?? null}::uuid`)
                        .where("closure.organization_id", "=", organization)
                        .unionAll(
                            kysely.selectNoFrom([
                                sql<string>`${organization}::uuid`.as("organization_id"),
                                sql<string>`${descendant}::uuid`.as("ancestor_id"),
                                sql<string>`${descendant}::uuid`.as("descendant_id"),
                                sql<number>`0`.as("depth"),
                            ]),
                        ),
                )
                .returning(CLOSURE_COLUMNS)
                .compile();

            await super.write({ transaction, query, type: ChangeSetType.CREATE });
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async moveSubtrees(
        props: Repositories.DepartmentClosure.MoveSubtrees.Props,
    ): Repositories.DepartmentClosure.MoveSubtrees.Result {
        try {
            const { transaction, oldParent, newParent, children, organization } = props;

            // NOTE[SQL-02]: see NOTES.md#SQL-02
            const deleteQuery = kysely
                .deleteFrom("organization.department_closure as closure")
                .where("closure.organization_id", "=", organization)
                .where("closure.descendant_id", "in", (eb) =>
                    eb
                        .selectFrom("organization.department_closure")
                        .select("descendant_id")
                        .where("ancestor_id", "in", children)
                        .where("organization_id", "=", organization),
                )
                .where("closure.ancestor_id", "in", (eb) =>
                    eb
                        .selectFrom("organization.department_closure")
                        .select("ancestor_id")
                        .where("descendant_id", "=", sql<string>`${oldParent}::uuid`)
                        .where("organization_id", "=", organization),
                )
                .returning(CLOSURE_COLUMNS)
                .compile();

            // NOTE[SQL-02]: see NOTES.md#SQL-02
            const insertQuery = kysely
                .insertInto("organization.department_closure")
                .columns(CLOSURE_COLUMNS)
                .expression(
                    kysely
                        .selectFrom("organization.department_closure as new_parent_paths")
                        .innerJoin("organization.department_closure as moved_subtree_paths", (join) =>
                            join
                                .on("moved_subtree_paths.ancestor_id", "in", children)
                                .on("moved_subtree_paths.organization_id", "=", sql<string>`${organization}::uuid`),
                        )
                        .select([
                            sql<string>`${organization}::uuid`.as("organization_id"),
                            "new_parent_paths.ancestor_id",
                            "moved_subtree_paths.descendant_id",
                            sql<number>`new_parent_paths.depth + moved_subtree_paths.depth + 1`.as("depth"),
                        ])
                        .where("new_parent_paths.descendant_id", "=", sql<string>`${newParent}::uuid`)
                        .where("new_parent_paths.organization_id", "=", organization),
                )
                .returning(CLOSURE_COLUMNS)
                .compile();

            const removedPaths = await super.write({ transaction, query: deleteQuery, type: ChangeSetType.DELETE });
            const upsertedPaths = await super.write({ transaction, query: insertQuery, type: ChangeSetType.CREATE });

            return { upsertedPaths, removedPaths };
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async decreaseTransitiveDepth(
        props: Repositories.DepartmentClosure.DecreaseTransitiveDepth.Props,
    ): Repositories.DepartmentClosure.DecreaseTransitiveDepth.Result {
        try {
            const { transaction, organization, department } = props;

            // NOTE[SQL-02]: see NOTES.md#SQL-02
            const query = kysely
                .updateTable("organization.department_closure")
                .set({ depth: sql<number>`depth - 1` })
                .where("organization_id", "=", organization)
                .where("ancestor_id", "!=", department)
                .where("descendant_id", "!=", department)
                .where((eb) =>
                    eb.exists(
                        eb
                            .selectFrom("organization.department_closure as path1")
                            .innerJoin("organization.department_closure as path2", (join) =>
                                join
                                    .on("path1.descendant_id", "=", sql<string>`${department}::uuid`)
                                    .on("path2.ancestor_id", "=", sql<string>`${department}::uuid`)
                                    .on("path1.organization_id", "=", sql<string>`${organization}::uuid`)
                                    .on("path2.organization_id", "=", sql<string>`${organization}::uuid`),
                            )
                            .select(sql`1`.as("matched"))
                            .whereRef("path1.ancestor_id", "=", "organization.department_closure.ancestor_id")
                            .whereRef("path2.descendant_id", "=", "organization.department_closure.descendant_id"),
                    ),
                )
                .returning([...CLOSURE_COLUMNS, sql`jsonb_build_object('depth', depth + 1)`.as("previous_state")])
                .compile();

            await super.write({ transaction, query, type: ChangeSetType.UPDATE });
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async move(props: Repositories.DepartmentClosure.Move.Props): Repositories.DepartmentClosure.Move.Result {
        try {
            const { transaction, newParent, target, organization } = props;

            const subtree = kysely
                .selectFrom("organization.department_closure as closure")
                .select(["closure.descendant_id", "closure.depth as subtree_depth"])
                .where("closure.ancestor_id", "=", target)
                .where("closure.organization_id", "=", organization);

            const oldAncestors = kysely
                .selectFrom("organization.department_closure as closure")
                .select("closure.ancestor_id")
                .where("closure.descendant_id", "=", target)
                .where("closure.depth", ">", 0)
                .where("closure.organization_id", "=", organization);

            const newAncestors = kysely
                .selectFrom("organization.department_closure as closure")
                .select(["closure.ancestor_id", "closure.depth as ancestor_depth"])
                .where("closure.descendant_id", "=", sql<string>`${newParent}::uuid`)
                .where("closure.organization_id", "=", organization);

            // NOTE[SQL-02]: see NOTES.md#SQL-02
            const deleteQuery = kysely
                .with("subtree", () => subtree)
                .with("old_ancestors", () => oldAncestors)
                .with("new_ancestors", () => newAncestors)
                .deleteFrom("organization.department_closure")
                .where("organization_id", "=", organization)
                .where("descendant_id", "in", (eb) => eb.selectFrom("subtree").select("descendant_id"))
                .where("ancestor_id", "in", (eb) => eb.selectFrom("old_ancestors").select("ancestor_id"))
                .where("ancestor_id", "not in", (eb) => eb.selectFrom("new_ancestors").select("ancestor_id"))
                .returning(CLOSURE_COLUMNS)
                .compile();

            const removedPaths = await super.write({ transaction, query: deleteQuery, type: ChangeSetType.DELETE });

            // NOTE[SQL-04]: see NOTES.md#SQL-04
            const upsertQuery = kysely
                .with("subtree", () => subtree)
                .with("new_ancestors", () => newAncestors)
                .with(
                    (cte) => cte("previous").materialized(),
                    (creator) =>
                        creator
                            .selectFrom("organization.department_closure as closure")
                            .select(["closure.ancestor_id", "closure.descendant_id", "closure.depth"])
                            .where("closure.organization_id", "=", organization)
                            .where("closure.descendant_id", "in", (eb) => eb.selectFrom("subtree").select("descendant_id"))
                            .where("closure.ancestor_id", "in", (eb) =>
                                eb.selectFrom("new_ancestors").select("ancestor_id"),
                            ),
                )
                .with("upserted", (creator) =>
                    creator
                        .insertInto("organization.department_closure")
                        .columns(CLOSURE_COLUMNS)
                        .expression((eb) =>
                            eb
                                .selectFrom(["new_ancestors", "subtree"])
                                .select([
                                    sql<string>`${organization}::uuid`.as("organization_id"),
                                    "new_ancestors.ancestor_id",
                                    "subtree.descendant_id",
                                    sql<number>`new_ancestors.ancestor_depth + subtree.subtree_depth + 1`.as("depth"),
                                ]),
                        )
                        .onConflict((conflict) =>
                            conflict.columns(["organization_id", "ancestor_id", "descendant_id"]).doUpdateSet((eb) => ({
                                depth: eb.ref("excluded.depth"),
                            })),
                        )
                        .returning(CLOSURE_COLUMNS),
                )
                .selectFrom("upserted")
                .leftJoin("previous", (join) =>
                    join
                        .onRef("previous.ancestor_id", "=", "upserted.ancestor_id")
                        .onRef("previous.descendant_id", "=", "upserted.descendant_id"),
                )
                .select([
                    "upserted.organization_id",
                    "upserted.ancestor_id",
                    "upserted.descendant_id",
                    "upserted.depth",
                    sql`to_jsonb(previous)`.as("previous_state"),
                ])
                .compile();

            const upsertedPaths = await super.write({ transaction, query: upsertQuery, type: ChangeSetType.CREATE });

            return { upsertedPaths, removedPaths };
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async existsTransitivePath(
        props: Repositories.DepartmentClosure.ExistsTransitivePath.Props,
    ): Repositories.DepartmentClosure.ExistsTransitivePath.Result {
        try {
            const { transaction, descendant, ancestor, organization } = props;
            const total = await transaction.count(DepartmentClosure, { ancestor, descendant, organization });

            return total > 0;
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }
}
