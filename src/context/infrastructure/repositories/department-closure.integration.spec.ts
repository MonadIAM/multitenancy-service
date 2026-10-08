import { ChangeSetType } from "@mikro-orm/postgresql";
import { describe, expect, it } from "@jest/globals";

import { DepartmentClosureFixture } from "~testing/integration/repositories/department-closure.fixture";
import { ExternalChanges } from "~infrastructure/database/utils/external-changes";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { DepartmentClosure } from "~context/domain/entities";

import { DepartmentClosureRepository } from "./department-closure.repository";

function pathKey(path: Entities.DepartmentClosure): string {
    return `${path.ancestor.id}:${path.descendant.id}:${path.depth}`;
}

describe("DepartmentClosureRepository", () => {
    const suite = postgresSuite({
        repository: () => new DepartmentClosureRepository(),
        fixture: (manager) => new DepartmentClosureFixture(manager),
    });

    it("preserves common ancestor paths and updates their depth during a subtree move", async () => {
        const { organization, a, b, c, d } = await suite.fixtures().tree();
        await suite.transaction(async (transaction) => {
            const closure = suite.repository();

            const result = await closure.move({
                transaction,
                organization: organization.id,
                target: c.id,
                newParent: a.id,
            });
            const changes = ExternalChanges.drain({ entityManager: transaction });

            expect(result.removedPaths.map(({ ancestor, descendant }) => [ancestor.id, descendant.id])).toEqual(
                expect.arrayContaining([
                    [b.id, c.id],
                    [b.id, d.id],
                ]),
            );
            expect(result.removedPaths).toHaveLength(2);
            expect(changes.filter(({ type }) => type === ChangeSetType.CREATE)).toHaveLength(0);
            expect(
                changes
                    .filter(({ type }) => type === ChangeSetType.UPDATE)
                    .map(({ payload }) => payload.depth)
                    .sort(),
            ).toEqual([1, 2]);
        });
        await suite.transaction(async (transaction) => {
            const paths = await transaction.find(
                DepartmentClosure,
                { organization: organization.id, descendant: { id: d.id }, depth: { $gt: 0 } },
                { orderBy: { depth: "DESC" } },
            );
            expect(paths.map(({ ancestor, depth }) => [ancestor.id, depth])).toEqual([
                [a.id, 2],
                [c.id, 1],
            ]);
        });
    });

    it.each([true, false])("inserts inherited paths and self path; has parent: %s", async (hasParent) => {
        const { organization, a, b } = await suite.fixtures().tree();
        const detached = await suite.fixtures().createDetachedDepartment(organization);
        await suite.transaction(async (transaction) => {
            await suite.repository().insertNewHierarchy({
                organization: organization.id,
                descendant: detached.id,
                ancestor: hasParent ? b.id : undefined,
                transaction,
            });

            const paths = await transaction.find(DepartmentClosure, { descendant: { id: detached.id } });
            expect(paths.map(pathKey).sort()).toEqual(
                [
                    `${detached.id}:${detached.id}:0`,
                    ...(hasParent ? [`${b.id}:${detached.id}:1`, `${a.id}:${detached.id}:2`] : []),
                ].sort(),
            );
            expect(paths.every((path) => path.organization.id === organization.id)).toBe(true);
            expect(
                ExternalChanges.drain({ entityManager: transaction }).every(({ type }) => type === ChangeSetType.CREATE),
            ).toBe(true);
        });
    });

    it("moves a subtree to another independent department", async () => {
        const { organization, a, b, c, d, x } = await suite.fixtures().tree();
        await suite.transaction(async (transaction) => {
            const props = { organization: organization.id, target: b.id, transaction };

            const moved = await suite.repository().move({ ...props, newParent: x.id });

            expect(moved.removedPaths.map(({ ancestor, descendant }) => `${ancestor.id}:${descendant.id}`).sort()).toEqual(
                [b, c, d].map((node) => `${a.id}:${node.id}`).sort(),
            );
            expect(
                moved.upsertedPaths
                    .map(({ ancestor, descendant, depth }) => `${ancestor.id}:${descendant.id}:${depth}`)
                    .sort(),
            ).toEqual([b, c, d].map((node, i) => `${x.id}:${node.id}:${i + 1}`).sort());
        });
    });

    it("promotes a subtree to an independent hierarchy", async () => {
        const { organization, a, b, c, d, x } = await suite.fixtures().tree();
        await suite.transaction(async (transaction) => {
            const props = { organization: organization.id, target: b.id, transaction };
            await suite.repository().move({ ...props, newParent: x.id });

            await suite.repository().move({ ...props, newParent: null });

            const paths = await transaction.find(DepartmentClosure, { organization: organization.id }, { refresh: true });
            expect(paths.map(pathKey).sort()).toEqual(
                [
                    ...[a, b, c, d, x].map((node) => `${node.id}:${node.id}:0`),
                    `${b.id}:${c.id}:1`,
                    `${b.id}:${d.id}:2`,
                    `${c.id}:${d.id}:1`,
                ].sort(),
            );
        });
    });

    it.each(["attach", "detach"] as const)("can %s several independent hierarchies together", async (operation) => {
        const { organization, a, b, c, d, x } = await suite.fixtures().tree();
        const sibling = await suite.fixtures().createDepartment({ organization });
        await suite.transaction(async (transaction) => {
            const props = { organization: organization.id, children: [a.id, sibling.id], transaction };
            if (operation === "detach") {
                await suite.repository().moveSubtrees({ ...props, oldParent: null, newParent: x.id });
            }
            const expected = [
                ...[a, b, c, d, x, sibling].map((node) => `${node.id}:${node.id}:0`),
                `${a.id}:${b.id}:1`,
                `${a.id}:${c.id}:2`,
                `${a.id}:${d.id}:3`,
                `${b.id}:${c.id}:1`,
                `${b.id}:${d.id}:2`,
                `${c.id}:${d.id}:1`,
                ...(operation === "attach"
                    ? [
                          `${x.id}:${a.id}:1`,
                          `${x.id}:${b.id}:2`,
                          `${x.id}:${c.id}:3`,
                          `${x.id}:${d.id}:4`,
                          `${x.id}:${sibling.id}:1`,
                      ]
                    : []),
            ];

            await suite.repository().moveSubtrees({
                ...props,
                oldParent: operation === "attach" ? null : x.id,
                newParent: operation === "attach" ? x.id : null,
            });

            const paths = await transaction.find(DepartmentClosure, { organization: organization.id }, { refresh: true });
            expect(paths.map(pathKey).sort()).toEqual(expected.sort());
        });
    });

    it("moves selected sibling subtrees together and preserves their internal paths", async () => {
        const { organization, a, b, c, d, x } = await suite.fixtures().tree();
        const sibling = await suite.fixtures().createDepartment({ organization });
        await suite.transaction(async (transaction) => {
            await suite
                .repository()
                .move({ organization: organization.id, target: sibling.id, newParent: a.id, transaction });

            await suite.repository().moveSubtrees({
                organization: organization.id,
                oldParent: a.id,
                newParent: x.id,
                children: [b.id, sibling.id],
                transaction,
            });

            const paths = await transaction.find(DepartmentClosure, { organization: organization.id }, { refresh: true });
            expect(paths.map(pathKey).sort()).toEqual(
                [
                    ...[a, b, c, d, x, sibling].map((node) => `${node.id}:${node.id}:0`),
                    `${x.id}:${b.id}:1`,
                    `${x.id}:${c.id}:2`,
                    `${x.id}:${d.id}:3`,
                    `${x.id}:${sibling.id}:1`,
                    `${b.id}:${c.id}:1`,
                    `${b.id}:${d.id}:2`,
                    `${c.id}:${d.id}:1`,
                ].sort(),
            );
        });
    });

    it("decreases only paths through the removed intermediate department", async () => {
        const { organization, a, b, c, d, x } = await suite.fixtures().tree();
        await suite.transaction(async (transaction) => {
            await suite
                .repository()
                .decreaseTransitiveDepth({ organization: organization.id, department: b.id, transaction });

            const paths = await transaction.find(DepartmentClosure, { organization: organization.id });
            expect(paths.map(pathKey).sort()).toEqual(
                [
                    ...[a, b, c, d, x].map((node) => `${node.id}:${node.id}:0`),
                    `${a.id}:${b.id}:1`,
                    `${a.id}:${c.id}:1`,
                    `${a.id}:${d.id}:2`,
                    `${b.id}:${c.id}:1`,
                    `${b.id}:${d.id}:2`,
                    `${c.id}:${d.id}:1`,
                ].sort(),
            );
            const changes = ExternalChanges.drain({ entityManager: transaction });
            expect(changes).toHaveLength(2);
            expect(changes.every(({ type }) => type === ChangeSetType.UPDATE)).toBe(true);
        });
    });

    it.each(["self", "transitive", "inverse", "unrelated", "foreign organization"] as const)(
        "checks a %s path",
        async (scenario) => {
            const { organization, a, b, d, x } = await suite.fixtures().tree();
            const external = await suite.fixtures().createOrganization();
            const cases = {
                self: [organization.id, a.id, a.id, true],
                transitive: [organization.id, a.id, d.id, true],
                inverse: [organization.id, d.id, a.id, false],
                unrelated: [organization.id, a.id, x.id, false],
                "foreign organization": [external.id, a.id, b.id, false],
            } as const;
            const [scope, ancestor, descendant, expected] = cases[scenario];

            const result = await suite.transaction((transaction) =>
                suite.repository().existsTransitivePath({
                    organization: scope,
                    ancestor,
                    descendant,
                    transaction,
                }),
            );

            expect(result).toBe(expected);
        },
    );

    it("rolls back closure changes with the caller's transaction", async () => {
        const { organization, b, x } = await suite.fixtures().tree();
        const before = await suite.transaction(async (transaction) =>
            (await transaction.find(DepartmentClosure, { organization: organization.id })).map(pathKey).sort(),
        );
        const failure = new Error("rollback");

        const result = suite.transaction(async (transaction) => {
            await suite.repository().move({ organization: organization.id, target: b.id, newParent: x.id, transaction });
            throw failure;
        });

        await expect(result).rejects.toBe(failure);
        const after = await suite.transaction(async (transaction) =>
            (await transaction.find(DepartmentClosure, { organization: organization.id })).map(pathKey).sort(),
        );
        expect(after).toEqual(before);
    });

    it("rejects closure references to a missing department", async () => {
        const { organization, a } = await suite.fixtures().tree();
        const missing = "00000000-0000-4000-8000-000000000001";

        const result = suite.transaction((transaction) =>
            suite.repository().insertNewHierarchy({
                organization: organization.id,
                ancestor: a.id,
                descendant: missing,
                transaction,
            }),
        );

        await expect(result).rejects.toThrow();
        await suite.transaction(async (transaction) => {
            expect(await transaction.count(DepartmentClosure, { descendant: missing })).toBe(0);
        });
    });
});
