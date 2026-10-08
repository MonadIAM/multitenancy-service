import { QueryOrder, wrap } from "@mikro-orm/postgresql";
import { describe, expect, it } from "@jest/globals";

import { DepartmentClosureFixture } from "~testing/integration/repositories/department-closure.fixture";
import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { DepartmentQueries } from "~context/application/queries/department.queries";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { DepartmentStatus, QueryMode, ResponseViewType } from "~context/enums";
import { Department, DepartmentClosure } from "~context/domain/entities";

import { DepartmentRepository } from "./department.repository";

const pagination = { currentPage: 1, elementsPerPage: 100 };

describe("DepartmentRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new DepartmentRepository(readManager),
        fixture: (entityManager) => new DepartmentClosureFixture(entityManager),
    });

    describe("findUniqueOrThrow", () => {
        it("maps the persisted department through the schema", async () => {
            const organization = await suite.fixtures().createOrganization();
            const department = await suite.fixtures().createDepartment({
                description: "Mapping department description",
                name: "Mapping Department",
                organization,
            });

            const loaded = await suite.repository().findUniqueOrThrow({ where: { id: department.id } });

            expect(loaded).toMatchObject({
                description: "Mapping department description",
                status: DepartmentStatus.ACTIVE,
                createdAt: department.createdAt,
                version: department.version,
                name: "Mapping Department",
                id: department.id,
            });
            expect(loaded.organization.id).toBe(organization.id);
        });
    });

    describe("findMany", () => {
        it("finds departments by organization, name and status mapper filters", async () => {
            const { organization, matched } = await suite.fixtures().filterScenario();

            const [departments, total] = await suite.repository().findMany({
                pagination: { currentPage: 1, elementsPerPage: 10 },
                sort: { createdAt: QueryOrder.ASC },
                filters: {
                    organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                    name: { operator: PublicStringOperator.ILIKE, value: "Alpha" },
                    status: { operator: PublicStringOperator.EQUAL, value: DepartmentStatus.ACTIVE },
                },
            });

            expect(total).toBe(1);
            expect(departments.map(({ id }) => id)).toEqual([matched.id]);
        });
    });

    it.each(["list", "lookup"] as const)("keeps the ordinary %s inside the requested organization", async (method) => {
        const organization = await suite.fixtures().createOrganization();
        const external = await suite.fixtures().createOrganization();
        const own = await suite.fixtures().createDepartment({ organization });
        await suite.fixtures().createDepartment({ organization: external });
        const queries = new DepartmentQueries(suite.repository());
        const props = {
            mode: QueryMode.DEFAULT,
            view: ResponseViewType.COMPACT,
            organization: organization.id,
            realm: organization.realm,
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: {},
        } as const;

        const [departments, total] =
            method === "list"
                ? await queries.findMany({ ...props, filters: {} })
                : await queries.getLookupList({ ...props, term: "" });

        expect(departments.map(({ id }) => id)).toEqual([own.id]);
        expect(total).toBe(1);
    });

    it.each([true, false])("supports management lists with organization filter: %s", async (filtered) => {
        const organization = await suite.fixtures().createOrganization();
        const external = await suite.fixtures().createOrganization();
        const own = await suite.fixtures().createDepartment({ organization });
        const foreign = await suite.fixtures().createDepartment({ organization: external });
        const queries = new DepartmentQueries(suite.repository());
        const props = {
            mode: QueryMode.MANAGE,
            view: ResponseViewType.COMPACT,
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: {},
        } as const;
        const filters = filtered ? { organization: { operator: PublicLinkOperator.EQUAL, value: external.id } } : {};
        const expected = filtered ? [foreign.id] : [own.id, foreign.id];

        const [departments, total] = await queries.findMany({ ...props, filters });

        expect(departments.map(({ id }) => id).sort()).toEqual(expected.sort());
        expect(total).toBe(expected.length);
    });

    describe("getLookupList", () => {
        it("uses trigram lookup scoped to organization", async () => {
            const scenario = await suite.fixtures().lookupSearchScenario();

            const [departments, total] = await suite.repository().getLookupList({
                pagination: { currentPage: 1, elementsPerPage: 10 },
                organization: scenario.organization.id,
                realm: scenario.organization.realm,
                term: scenario.term,
            });

            expect(total).toBe(2);
            expect(departments[0]?.id).toBe(scenario.exact.id);
            expect(departments.map(({ name }) => name)).toEqual(scenario.expectedNames);
        });
    });
    it("returns the graph of all independent hierarchies", async () => {
        const { organization, a, b, c, d, x } = await suite.fixtures().tree();
        const repository = suite.repository();

        const graph = await repository.getHierarchyGraph({ organization: organization.id, realm: organization.realm });

        expect(graph.nodes.map(({ id }) => id).sort()).toEqual([a.id, b.id, c.id, d.id, x.id].sort());
        expect(graph.nodes.find(({ id }) => id === a.id)).toEqual({
            id: a.id,
            label: a.name,
            attributes: { status: a.status },
        });
        expect(graph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ source: a.id, target: b.id }),
                expect.objectContaining({ source: b.id, target: c.id }),
                expect.objectContaining({ source: c.id, target: d.id }),
            ]),
        );
        expect(graph.edges).toHaveLength(3);
    });

    it("returns ancestors including the selected department", async () => {
        const { organization, a, b, c, d } = await suite.fixtures().tree();
        const repository = suite.repository();

        const [ancestors] = await repository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: d.id,
            pagination,
        });

        expect(ancestors.map(({ id, depth }) => [id, depth])).toEqual([
            [a.id, 3],
            [b.id, 2],
            [c.id, 1],
            [d.id, 0],
        ]);
    });

    it("returns descendants in descending depth order", async () => {
        const { organization, b, c, d } = await suite.fixtures().tree();
        const repository = suite.repository();

        const [children, count] = await repository.findDescendants({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            ancestor: b.id,
            pagination,
        });

        expect(children.map(({ id, depth }) => [id, depth])).toEqual([
            [d.id, 2],
            [c.id, 1],
            [b.id, 0],
        ]);
        expect(count).toBe(3);
    });

    it("returns the selected independent department as its own ancestor", async () => {
        const { organization, a } = await suite.fixtures().tree();
        const repository = suite.repository();

        const [roots] = await repository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: a.id,
            pagination,
        });

        expect(roots.map(({ id, depth }) => [id, depth])).toEqual([[a.id, 0]]);
    });

    it("paginates descendants while reporting the full count", async () => {
        const { organization, a, b } = await suite.fixtures().tree();
        const repository = suite.repository();

        const [page, total] = await repository.findDescendants({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            ancestor: a.id,
            pagination: { currentPage: 2, elementsPerPage: 2 },
        });

        expect(page.map(({ id }) => id)).toEqual([b.id, a.id]);
        expect(total).toBe(4);
    });

    it.each(["ancestors", "descendants"] as const)(
        "filters returned %s before pagination and honors custom populate",
        async (direction) => {
            const { organization, a, b, c, d } = await suite.fixtures().tree();
            await suite.transaction(async (transaction) => {
                await transaction.nativeUpdate(Department, { id: b.id }, { name: "Selected B" });
                await transaction.nativeUpdate(Department, { id: c.id }, { name: "Selected C" });
                await transaction.nativeUpdate(
                    Department,
                    { id: d.id },
                    {
                        name: "Selected D",
                        status: DepartmentStatus.ARCHIVED,
                    },
                );
            });
            const repository = suite.repository();
            const props = {
                organization: organization.id,
                realm: organization.realm,
                pagination: { currentPage: 1, elementsPerPage: 1 },
                filters: {
                    name: { operator: PublicStringOperator.ILIKE, value: "Selected" },
                    status: { operator: PublicStringOperator.EQUAL, value: DepartmentStatus.ACTIVE },
                },
            };
            const read = (
                populate: readonly ORM.EntityKey<Entities.Department>[],
            ): Repositories.Department.FindAncestors.Result =>
                direction === "ancestors"
                    ? repository.findAncestors({ ...props, descendant: d.id, populate })
                    : repository.findDescendants({ ...props, ancestor: a.id, populate });
            const expected = direction === "ancestors" ? b : c;

            const [compact, compactTotal] = await read([]);
            const [detailed, detailedTotal] = await read(["organization"]);

            expect(compactTotal).toBe(2);
            expect(detailedTotal).toBe(2);
            expect(compact.map(({ id, depth }) => [id, depth])).toEqual([[expected.id, 2]]);
            expect(detailed.map(({ id }) => id)).toEqual([expected.id]);
            expect(wrap(compact[0]!.organization).isInitialized()).toBe(false);
            expect(wrap(detailed[0]!.organization).isInitialized()).toBe(true);
            expect(detailed[0]!.organization.title).toBe(organization.title);
        },
    );

    describe.each(["ancestors", "descendants"] as const)("get %s", (direction) => {
        it.each(["all", "self", "direct", "filter", "limit", "refresh"] as const)(
            "honors the %s query",
            async (scenario) => {
                const { organization, a, b, c, d } = await suite.fixtures().tree();
                const repository = suite.repository();
                const expected = {
                    all: direction === "ancestors" ? [a.id, b.id, c.id, d.id] : [d.id, c.id, b.id, a.id],
                    self: [direction === "ancestors" ? d.id : a.id],
                    direct: [direction === "ancestors" ? c.id : b.id],
                    filter: [b.id],
                    limit: [direction === "ancestors" ? a.id : d.id],
                    refresh: [direction === "ancestors" ? a.id : d.id],
                };
                await suite.transaction(async (transaction) => {
                    const where: ORM.FilterQuery<Entities.Department> = { organization: organization.id };
                    const options: ORM.FindOptions<Entities.DepartmentClosure> = {};
                    const depth = scenario === "self" ? 0 : scenario === "direct" ? 1 : undefined;
                    if (scenario === "filter") {
                        where.name = b.name;
                    }
                    if (scenario === "limit") {
                        options.limit = 1;
                    }
                    if (scenario === "refresh") {
                        const target = direction === "ancestors" ? a : d;
                        await transaction.findOneOrFail(Department, target.id);
                        await transaction.nativeUpdate(Department, { id: target.id }, { name: "Refreshed" });
                        where.id = target.id;
                        options.refresh = true;
                    }

                    const entities =
                        direction === "ancestors"
                            ? await repository.getAncestors({ descendant: d.id, transaction, where, options, depth })
                            : await repository.getDescendants({ ancestor: a.id, transaction, where, options, depth });

                    expect(entities.map(({ id }) => id)).toEqual(expected[scenario]);
                    if (scenario === "refresh") {
                        expect(entities[0]?.name).toBe("Refreshed");
                    }
                });
            },
        );
    });

    it("returns an empty graph when there are no departments", async () => {
        const organization = await suite.fixtures().createOrganization();

        const graph = await suite
            .repository()
            .getHierarchyGraph({ organization: organization.id, realm: organization.realm });

        expect(graph).toEqual({ nodes: [], edges: [] });
    });

    it("reads an uncommitted hierarchy through the caller's transaction", async () => {
        const organization = await suite.fixtures().createOrganization();
        const repository = suite.repository();
        await suite.transaction(async (transaction) => {
            const root = new Department({ organization, name: "Root", description: "" });
            const child = new Department({ organization, name: "Child", description: "" });
            transaction.persist([
                root,
                child,
                new DepartmentClosure({ organization, ancestor: root, descendant: root, depth: 0 }),
                new DepartmentClosure({ organization, ancestor: child, descendant: child, depth: 0 }),
                new DepartmentClosure({ organization, ancestor: root, descendant: child, depth: 1 }),
            ]);
            await transaction.flush();

            const graph = await repository.getHierarchyGraph({
                organization: organization.id,
                realm: organization.realm,
                transaction,
            });

            expect(graph.nodes.map(({ id }) => id).sort()).toEqual([root.id, child.id].sort());
            expect(graph.edges).toEqual([{ id: `edge_${root.id}_${child.id}`, source: root.id, target: child.id }]);
        });
    });

    it.each(["graph", "ancestors", "descendants"] as const)("isolates %s reads between organizations", async (method) => {
        const { b } = await suite.fixtures().tree();
        const external = await suite.fixtures().createOrganization();
        const repository = suite.repository();
        const props = { organization: external.id, realm: external.realm, filters: {}, populate: [], pagination };

        const result =
            method === "graph"
                ? await repository.getHierarchyGraph(props)
                : method === "ancestors"
                  ? await repository.findAncestors({ ...props, descendant: b.id })
                  : await repository.findDescendants({ ...props, ancestor: b.id });

        expect(result).toEqual(method === "graph" ? { nodes: [], edges: [] } : [[], 0]);
    });

    it.each(["ancestors", "descendants"] as const)(
        "isolates transactional %s reads between organizations",
        async (direction) => {
            const { b } = await suite.fixtures().tree();
            const external = await suite.fixtures().createOrganization();
            const repository = suite.repository();
            const where = { organization: external.id };

            const result = await suite.transaction((transaction) =>
                direction === "ancestors"
                    ? repository.getAncestors({ where, descendant: b.id, transaction })
                    : repository.getDescendants({ where, ancestor: b.id, transaction }),
            );

            expect(result).toEqual([]);
        },
    );

    describe.each(["matching", "foreign"] as const)("organization realm: %s", (scope) => {
        it.each(["single", "list", "lookup", "ancestors", "descendants", "graph"] as const)(
            "scopes the %s query",
            async (method) => {
                const { organization, a, b } = await suite.fixtures().tree();
                const foreign = await suite.fixtures().createOrganization();
                const queries = new DepartmentQueries(suite.repository());
                const props = {
                    organization: organization.id,
                    realm: scope === "matching" ? organization.realm : foreign.realm,
                    view: ResponseViewType.COMPACT,
                    pagination,
                };
                const execute = (): Promise<
                    Entities.Department | [Entities.Department[], number] | Repositories.Department.Graph.Data
                > => {
                    switch (method) {
                        case "single":
                            return queries.findUnique({ ...props, department: b.id });
                        case "list":
                            return queries.findMany({ ...props, mode: QueryMode.DEFAULT, filters: {}, sort: {} });
                        case "lookup":
                            return queries.getLookupList({ ...props, term: "" });
                        case "ancestors":
                            return queries.findAncestors({ ...props, filters: {}, descendant: b.id });
                        case "descendants":
                            return queries.findDescendants({ ...props, filters: {}, ancestor: a.id });
                        case "graph":
                            return queries.getHierarchyGraph(props);
                        default:
                            throw new Error(`Unknown query: ${method}`);
                    }
                };
                const count = { single: 1, list: 5, lookup: 5, ancestors: 2, descendants: 4, graph: 5 }[method];

                const result = execute();

                if (method === "single") {
                    if (scope === "foreign") {
                        await expect(result).rejects.toThrow();
                    } else {
                        await expect(result).resolves.toMatchObject({ id: b.id });
                    }
                } else {
                    const value = await result;
                    if ("nodes" in value) {
                        expect(value.nodes).toHaveLength(scope === "matching" ? count : 0);
                        expect(value.edges).toHaveLength(scope === "matching" ? 3 : 0);
                    } else if (Array.isArray(value)) {
                        expect(value[0]).toHaveLength(scope === "matching" ? count : 0);
                        expect(value[1]).toBe(scope === "matching" ? count : 0);
                    } else {
                        throw new Error("Expected a graph or paginated list");
                    }
                }
            },
        );
    });
});
