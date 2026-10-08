import { describe, expect, it } from "@jest/globals";

import { DepartmentIntegrationHelpers } from "~testing/integration/domain-service/department.helpers";
import { Department, DepartmentClosure, Team } from "~context/domain/entities";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { MoveMode } from "~context/enums";

const helpers = new DepartmentIntegrationHelpers();
const pagination = { currentPage: 1, elementsPerPage: 100 };

describe("DepartmentService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("adopts multiple sibling subtrees under a new department", async () => {
        const { organization, a, b, c, d } = await helpers.tree(suite);
        const sibling = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: { name: "Sibling", description: "", parent: a.id },
            }),
        );

        const group = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: {
                    name: "Group",
                    description: "",
                    parent: a.id,
                    children: [b.id, sibling.id],
                },
            }),
        );

        const repository = suite.repository().departmentRepository;
        const [grouped] = await repository.findDescendants({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            ancestor: group.id,
            pagination,
        });
        expect(grouped.map(({ id }) => id).sort()).toEqual([group.id, b.id, c.id, d.id, sibling.id].sort());
    });

    it("detaches multiple sibling subtrees when moving their parent without descendants", async () => {
        const { organization, a, b, c, d, x } = await helpers.tree(suite);
        const sibling = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: { name: "Sibling", description: "", parent: a.id },
            }),
        );
        const group = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: {
                    name: "Group",
                    description: "",
                    parent: a.id,
                    children: [b.id, sibling.id],
                },
            }),
        );
        const repository = suite.repository().departmentRepository;

        await suite.transaction((transaction) =>
            suite.repository().departmentService.move({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                target: group.id,
                targetParent: x.id,
                mode: MoveMode.PARALLEL,
            }),
        );

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
        const [siblingAncestors] = await repository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: sibling.id,
            pagination,
        });
        expect(siblingAncestors.map(({ id }) => id)).toEqual([a.id, sibling.id]);
    });

    it.each([MoveMode.SUBTREE, MoveMode.PARALLEL])(
        "moves using %s while preserving teams and position references",
        async (mode) => {
            const { organization, a, b, c, d, x } = await helpers.tree(suite);
            const team = await suite.fixtures().createTeam({ department: b });
            await suite.transaction(async (transaction) => {
                const target = await transaction.findOneOrFail(Department, b.id);
                target.managerPosition = x.id;
            });

            await suite.transaction((transaction) =>
                suite.repository().departmentService.move({
                    transaction,
                    organization: organization.id,
                    realm: organization.realm,
                    target: b.id,
                    targetParent: x.id,
                    mode,
                }),
            );

            const [ancestors] = await suite.repository().departmentRepository.findAncestors({
                filters: {},
                populate: [],
                organization: organization.id,
                realm: organization.realm,
                descendant: d.id,
                pagination,
            });
            expect(ancestors.map(({ id }) => id)).toEqual(
                mode === MoveMode.SUBTREE ? [x.id, b.id, c.id, d.id] : [a.id, c.id, d.id],
            );
            const [bAncestors] = await suite.repository().departmentRepository.findAncestors({
                filters: {},
                populate: [],
                organization: organization.id,
                realm: organization.realm,
                descendant: b.id,
                pagination,
            });
            expect(bAncestors.map(({ id }) => id)).toEqual([x.id, b.id]);
            await suite.transaction(async (transaction) => {
                expect((await transaction.findOneOrFail(Department, b.id)).managerPosition).toBe(x.id);
                expect((await transaction.findOneOrFail(Team, team.id)).department.id).toBe(b.id);
            });
        },
    );

    it("moves an independent department without its children", async () => {
        const { organization, a, b, c, x } = await helpers.tree(suite);
        await suite.transaction((transaction) =>
            suite.repository().departmentService.move({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                target: b.id,
                targetParent: null,
                mode: MoveMode.SUBTREE,
            }),
        );

        await suite.transaction((transaction) =>
            suite.repository().departmentService.move({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                target: b.id,
                targetParent: x.id,
                mode: MoveMode.PARALLEL,
            }),
        );

        const graph = await suite
            .repository()
            .departmentRepository.getHierarchyGraph({ organization: organization.id, realm: organization.realm });
        expect(graph.edges).toHaveLength(2);
        expect(graph.edges).toEqual(expect.arrayContaining([expect.objectContaining({ source: x.id, target: b.id })]));
        const [ancestors] = await suite.repository().departmentRepository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: c.id,
            pagination,
        });
        expect(ancestors.map(({ id }) => id)).toEqual([c.id]);
        const [oldRoot] = await suite.repository().departmentRepository.findDescendants({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            ancestor: a.id,
            pagination,
        });
        expect(oldRoot.map(({ id }) => id)).toEqual([a.id]);
    });

    it("allows a parallel move below a former descendant after detaching children", async () => {
        const { organization, a, b, c, d } = await helpers.tree(suite);

        await suite.transaction((transaction) =>
            suite.repository().departmentService.move({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                target: b.id,
                targetParent: d.id,
                mode: MoveMode.PARALLEL,
            }),
        );

        const [ancestors] = await suite.repository().departmentRepository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: b.id,
            pagination,
        });
        expect(ancestors.map(({ id }) => id)).toEqual([a.id, c.id, d.id, b.id]);
    });

    it("inserts an intermediate level above selected child subtrees", async () => {
        const { organization, a, b, c, d } = await helpers.tree(suite);

        const inserted = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: {
                    name: "Inserted",
                    description: "",
                    parent: a.id,
                    children: [b.id, b.id],
                },
            }),
        );

        const [ancestors] = await suite.repository().departmentRepository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: d.id,
            pagination,
        });
        expect(ancestors.map(({ id }) => id)).toEqual([a.id, inserted.id, b.id, c.id, d.id]);
    });

    it("removes an intermediate level without deleting descendant branches", async () => {
        const { organization, a, b, c, d } = await helpers.tree(suite);
        const inserted = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: {
                    name: "Inserted",
                    description: "",
                    parent: a.id,
                    children: [b.id, b.id],
                },
            }),
        );
        await suite.transaction(async (transaction) => {
            await suite.repository().departmentService.archive({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                identifiers: [inserted.id],
            });
        });

        await suite.transaction(async (transaction) => {
            await suite.repository().departmentService.purge({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                id: inserted.id,
            });
        });

        const [after] = await suite.repository().departmentRepository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: d.id,
            pagination,
        });
        expect(after.map(({ id }) => id)).toEqual([a.id, b.id, c.id, d.id]);
    });

    it("groups selected independent departments under a new department", async () => {
        const { organization, a, x } = await helpers.tree(suite);

        const root = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: { name: "Group", description: "", children: [a.id, x.id] },
            }),
        );

        const graph = await suite.repository().departmentRepository.getHierarchyGraph({
            organization: organization.id,
            realm: organization.realm,
        });
        expect(graph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ source: root.id, target: a.id }),
                expect.objectContaining({ source: root.id, target: x.id }),
            ]),
        );
        expect(graph.nodes).toHaveLength(6);
    });

    it("removes a grouping department while retaining all child hierarchies", async () => {
        const { organization, a, x } = await helpers.tree(suite);
        const root = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                input: { name: "Group", description: "", children: [a.id, x.id] },
            }),
        );
        await suite.transaction(async (transaction) => {
            await suite.repository().departmentService.archive({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                identifiers: [root.id],
            });
        });

        await suite.transaction(async (transaction) => {
            await suite.repository().departmentService.purge({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                id: root.id,
            });
        });

        const [ancestors] = await suite.repository().departmentRepository.findAncestors({
            filters: {},
            populate: [],
            organization: organization.id,
            realm: organization.realm,
            descendant: a.id,
            pagination,
        });
        expect(ancestors.map(({ id }) => id)).toEqual([a.id]);
        expect(
            (
                await suite
                    .repository()
                    .departmentRepository.getHierarchyGraph({ organization: organization.id, realm: organization.realm })
            ).nodes,
        ).toHaveLength(5);
    });

    it.each(["current parent", "self", "descendant", "foreign parent", "foreign target"] as const)(
        "rejects moving to %s without changing the hierarchy",
        async (scenario) => {
            const { organization, a, b, c } = await helpers.tree(suite);
            const external = await suite.fixtures().createOrganization();
            const foreign = await suite.fixtures().createDepartment({ organization: external });
            const repository = suite.repository().departmentRepository;
            const scope = { organization: organization.id, realm: organization.realm };
            const before = await repository.getHierarchyGraph(scope);
            const targets = {
                "current parent": a.id,
                self: b.id,
                descendant: c.id,
                "foreign parent": foreign.id,
                "foreign target": null,
            };
            const requestScope =
                scenario === "foreign target" ? { organization: external.id, realm: external.realm } : scope;

            const result = suite.transaction((transaction) =>
                suite.repository().departmentService.move({
                    ...requestScope,
                    transaction,
                    target: b.id,
                    targetParent: targets[scenario],
                    mode: MoveMode.SUBTREE,
                }),
            );

            await expect(result).rejects.toThrow();
            expect(await repository.getHierarchyGraph(scope)).toEqual(before);
        },
    );

    it.each(["indirect child", "unrelated department", "foreign child", "non-root", "foreign root"] as const)(
        "rejects adopting a %s and rolls back the new department",
        async (scenario) => {
            const { organization, a, b, c, x } = await helpers.tree(suite);
            const external = await suite.fixtures().createOrganization();
            const foreign = await suite.fixtures().createDepartment({ organization: external });
            const repository = suite.repository().departmentRepository;
            const scope = { organization: organization.id, realm: organization.realm };
            const before = await repository.getHierarchyGraph(scope);
            const children = {
                "indirect child": c.id,
                "unrelated department": x.id,
                "foreign child": foreign.id,
                "non-root": b.id,
                "foreign root": foreign.id,
            };
            const parent = scenario === "non-root" || scenario === "foreign root" ? undefined : a.id;

            const result = suite.transaction((transaction) =>
                suite.repository().departmentService.create({
                    ...scope,
                    transaction,
                    input: { name: "Invalid", description: "", parent, children: [children[scenario]] },
                }),
            );

            await expect(result).rejects.toThrow("CREATE_CHILD_NOT_DIRECT_DESCENDANT");
            expect(await repository.getHierarchyGraph(scope)).toEqual(before);
        },
    );

    it("rolls back reparenting when purge is blocked by a team's foreign key", async () => {
        const { organization, b } = await helpers.tree(suite);
        await suite.fixtures().createTeam({ department: b });
        await suite.transaction((transaction) =>
            suite.repository().departmentService.archive({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                identifiers: [b.id],
            }),
        );
        const before = await suite
            .repository()
            .departmentRepository.getHierarchyGraph({ organization: organization.id, realm: organization.realm });

        const result = suite.transaction((transaction) =>
            suite.repository().departmentService.purge({
                transaction,
                organization: organization.id,
                realm: organization.realm,
                id: b.id,
            }),
        );

        await expect(result).rejects.toThrow();
        expect(
            await suite
                .repository()
                .departmentRepository.getHierarchyGraph({ organization: organization.id, realm: organization.realm }),
        ).toEqual(before);
    });

    it("serializes concurrent opposing moves so that only one succeeds", async () => {
        const { organization, a, x } = await helpers.tree(suite);

        const results = await Promise.allSettled([
            suite.transaction((transaction) =>
                suite.repository().departmentService.move({
                    transaction,
                    organization: organization.id,
                    realm: organization.realm,
                    target: a.id,
                    targetParent: x.id,
                    mode: MoveMode.SUBTREE,
                }),
            ),
            suite.transaction((transaction) =>
                suite.repository().departmentService.move({
                    transaction,
                    organization: organization.id,
                    realm: organization.realm,
                    target: x.id,
                    targetParent: a.id,
                    mode: MoveMode.SUBTREE,
                }),
            ),
        ]);

        expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
        expect(results.filter(({ status }) => status === "rejected")).toHaveLength(1);
        await suite.transaction(async (transaction) => {
            const paths = await transaction.find(DepartmentClosure, {
                organization: organization.id,
                ancestor: { id: a.id },
                descendant: { id: x.id },
            });
            const inverse = await transaction.find(DepartmentClosure, {
                organization: organization.id,
                ancestor: { id: x.id },
                descendant: { id: a.id },
            });
            expect(paths.length + inverse.length).toBe(1);
        });
    });

    it("creates another independent department in an organization with existing hierarchies", async () => {
        const { organization, a, x } = await helpers.tree(suite);
        const repository = suite.repository().departmentRepository;
        const scope = { organization: organization.id, realm: organization.realm };
        const before = await repository.getHierarchyGraph(scope);

        const department = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                input: { name: "Independent", description: "Description" },
                ...scope,
                transaction,
            }),
        );

        const graph = await repository.getHierarchyGraph(scope);
        expect(department.organization.id).toBe(organization.id);
        expect(graph.nodes.map(({ id }) => id)).toEqual(expect.arrayContaining([a.id, x.id, department.id]));
        expect(graph.nodes).toHaveLength(before.nodes.length + 1);
        expect(graph.edges).toEqual(before.edges);
        const [ancestors] = await repository.findAncestors({
            ...scope,
            filters: {},
            populate: [],
            descendant: department.id,
            pagination,
        });
        expect(ancestors.map(({ id, depth }) => [id, depth])).toEqual([[department.id, 0]]);
    });

    it("archives a department within the requested organization", async () => {
        const { organization, b } = await helpers.tree(suite);

        await suite.transaction((transaction) =>
            suite.repository().departmentService.archive({
                identifiers: [b.id],
                organization: organization.id,
                realm: organization.realm,
                transaction,
            }),
        );

        const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Department, b.id));
        expect(loaded.status).toBe("ARCHIVED");
    });

    it("updates a department when its organization belongs to the requested realm", async () => {
        const { organization, b } = await helpers.tree(suite);

        await suite.transaction((transaction) =>
            suite.repository().departmentService.update({
                id: b.id,
                organization: organization.id,
                realm: organization.realm,
                patch: { name: "Allowed" },
                transaction,
            }),
        );

        const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Department, b.id));
        expect(loaded.name).toBe("Allowed");
    });

    describe.each(["organization", "realm"] as const)("scope mismatch: %s", (mismatch) => {
        it.each(["update", "changeManager", "create", "move", "archive", "restore", "purge"] as const)(
            "rejects %s and preserves department state",
            async (method) => {
                const { organization, b, x } = await helpers.tree(suite);
                const external = await suite.fixtures().createOrganization();
                const service = suite.repository().departmentService;
                const scope = {
                    organization: mismatch === "organization" ? external.id : organization.id,
                    realm: external.realm,
                };
                const execute = (transaction: ORM.EntityManager): Promise<unknown> => {
                    const props = { ...scope, transaction };
                    switch (method) {
                        case "update":
                            return service.update({ ...props, id: b.id, patch: { name: "Foreign" } });
                        case "changeManager":
                            return service.changeManager({ ...props, id: b.id, position: null });
                        case "create":
                            return service.create({
                                ...props,
                                input: {
                                    parent: b.id,
                                    name: "Foreign",
                                    description: "",
                                },
                            });
                        case "move":
                            return service.move({
                                ...props,
                                target: b.id,
                                targetParent: x.id,
                                mode: MoveMode.SUBTREE,
                            });
                        case "archive":
                            return service.archive({ ...props, identifiers: [b.id] });
                        case "restore":
                            return service.restore({ ...props, identifiers: [b.id] });
                        case "purge":
                            return service.purge({ ...props, id: b.id });
                        default:
                            throw new Error(`Unknown mutation: ${method}`);
                    }
                };

                const result = suite.transaction(execute);

                await expect(result).rejects.toThrow();
                const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Department, b.id));
                expect(loaded.organization.id).toBe(organization.id);
                expect(loaded.name).toBe(b.name);
                expect(loaded.status).toBe(b.status);
            },
        );
    });
});
