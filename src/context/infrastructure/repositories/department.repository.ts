import { InjectEntityManager } from "@mikro-orm/nestjs";
import { QueryOrder, raw } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import { sql } from "kysely";

import { Department, DepartmentClosure } from "~context/domain/entities";
import { kysely, ORMAdapter } from "~infrastructure/database";
import { ExceptionMapper } from "~common/exceptions";
import { BaseRepository } from "~common/mixins";

import { DepartmentMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentRepository
    extends BaseRepository<Entities.Department, Repositories.Mappers.Department.Types>({
        Mapper: DepartmentMapper,
        Entity: Department,
    })
    implements Repositories.Department.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }

    public async getHierarchyGraph(
        props: Repositories.Department.GetHierarchyGraph.Props,
    ): Repositories.Department.GetHierarchyGraph.Result {
        try {
            const { transaction, organization, realm } = props;
            const entityManager = transaction ?? this.readManager;

            const nodesCTE = kysely
                .selectFrom("organization.department as department")
                .select([
                    "department.id",
                    "department.name as label",
                    sql`jsonb_build_object('status', department.status)`.as("attributes"),
                ])
                .where("department.organization_id", "=", organization);

            const edgesCTE = kysely
                .selectFrom("organization.department_closure as closure")
                .select([
                    sql`'edge_' || closure.ancestor_id || '_' || closure.descendant_id`.as("id"),
                    "closure.ancestor_id as source",
                    "closure.descendant_id as target",
                ])
                .where("closure.organization_id", "=", organization)
                .where("closure.depth", "=", 1);

            // NOTE[SQL-05]: see NOTES.md#SQL-05
            const builder = kysely
                .with("formatted_nodes", () => nodesCTE)
                .with("formatted_edges", () => edgesCTE)
                .selectNoFrom([
                    sql`COALESCE((SELECT json_agg(formatted_nodes) FROM formatted_nodes), '[]'::json)`.as("nodes"),
                    sql`COALESCE((SELECT json_agg(formatted_edges) FROM formatted_edges), '[]'::json)`.as("edges"),
                ])
                .where((eb) =>
                    eb.exists(
                        eb
                            .selectFrom("organization.organization")
                            .select("id")
                            .where("id", "=", organization)
                            .where("realm_id", "=", realm),
                    ),
                );

            const query = builder.compile();
            const result = await entityManager.execute<Repositories.Department.Graph.Data>(
                query.sql,
                [...query.parameters],
                "get",
            );
            return { nodes: result?.nodes ?? [], edges: result?.edges ?? [] };
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async getAncestors(
        props: Repositories.Department.GetAncestors.Props,
    ): Repositories.Department.GetAncestors.Result {
        try {
            const where: ORM.FilterQuery<Entities.DepartmentClosure> = {
                descendant: props.descendant,
                ancestor: props.where ?? {},
            };
            if (props.depth !== undefined) {
                where.depth = props.depth;
            }
            return await props.transaction
                .find(DepartmentClosure, where, {
                    ...props.options,
                    populate: ["ancestor"],
                    orderBy: { depth: QueryOrder.DESC },
                })
                .then((relations) => relations.map(({ ancestor }) => ancestor));
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async findAncestors(
        props: Repositories.Department.FindAncestors.Props,
    ): Repositories.Department.FindAncestors.Result {
        try {
            const { populate, pagination, filters, descendant } = props;
            const ancestorPopulate = populate.map((key) => `ancestor.${key}` as const);
            const where = super.buildWhereORM(filters, {
                organization: { id: props.organization, realm: props.realm },
            });
            const entityManager = this.readManager.fork();
            return await entityManager
                .findAndCount(
                    DepartmentClosure,
                    { descendant, ancestor: where },
                    {
                        populate: ["ancestor", ...ancestorPopulate],
                        orderBy: { depth: QueryOrder.DESC },
                        ...ORMAdapter.pagination(pagination),
                    },
                )
                .then(([relations, total]) => [
                    relations.map(({ ancestor, depth }) => Object.assign(ancestor, { depth })),
                    total,
                ]);
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async getDescendants(
        props: Repositories.Department.GetDescendants.Props,
    ): Repositories.Department.GetDescendants.Result {
        try {
            const where: ORM.FilterQuery<Entities.DepartmentClosure> = {
                descendant: props.where ?? {},
                ancestor: props.ancestor,
            };
            if (props.depth !== undefined) {
                where.depth = props.depth;
            }
            return await props.transaction
                .find(DepartmentClosure, where, {
                    ...props.options,
                    populate: ["descendant"],
                    orderBy: { depth: QueryOrder.DESC },
                })
                .then((relations) => {
                    return relations.map(({ descendant }) => descendant);
                });
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async findDescendants(
        props: Repositories.Department.FindDescendants.Props,
    ): Repositories.Department.FindDescendants.Result {
        try {
            const { populate, pagination, filters, ancestor } = props;
            const descendantPopulate = populate.map((key) => `descendant.${key}` as const);
            const where = super.buildWhereORM(filters, { organization: { id: props.organization, realm: props.realm } });
            const entityManager = this.readManager.fork();
            return await entityManager
                .findAndCount(
                    DepartmentClosure,
                    { ancestor, descendant: where },
                    {
                        populate: ["descendant", ...descendantPopulate],
                        orderBy: { depth: QueryOrder.DESC },
                        ...ORMAdapter.pagination(pagination),
                    },
                )
                .then(([relations, total]) => [
                    relations.map(({ descendant, depth }) => Object.assign(descendant, { depth })),
                    total,
                ]);
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }

    public async getLookupList(
        props: Repositories.Department.GetLookupList.Props,
    ): Repositories.Department.GetLookupList.Result {
        try {
            const { organization, pagination, term, realm } = props;
            const entityManager = this.readManager.fork();
            const builder = entityManager.createQueryBuilder(Department, "d");

            builder
                .select(["d.id", "d.name"])
                .limit(pagination.elementsPerPage)
                .offset((pagination.currentPage - 1) * pagination.elementsPerPage);

            builder.where({ organization: { id: organization, realm } });

            if (term) {
                builder
                    .andWhere("d.name % ?", [term])
                    .orderBy([{ [raw("similarity(d.name, ?)", [term])]: "DESC" }, { "d.name": "ASC" }, { "d.id": "ASC" }]);
            } else {
                builder.orderBy({ "d.name": "ASC", "d.id": "ASC" });
            }

            return await builder.getResultAndCount();
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }
}
