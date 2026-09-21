import { describe, expect, it } from "@jest/globals";

import { DepartmentCommandsUnitHelpers } from "~testing/unit/command-services/department.helpers";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const helpers = new DepartmentCommandsUnitHelpers();

describe("DepartmentCommands", () => {
    it("creates in a transaction with the required ownership scope", async () => {
        const { commands, departmentService, transaction, run } = helpers.commands();
        const input = { organization: "parent-id", name: "New entity", description: "Description" };
        const created = helpers.createDepartment();
        departmentService.create.mockResolvedValue(created);

        await commands.create({ input, actor: ACTOR, context: CONTEXT, realm: REALM });

        expect(departmentService.create.mock.calls).toEqual([
            [{ input, transaction: transaction.entityManager, realm: REALM }],
        ]);
        expect(run.mock.calls).toEqual([
            [expect.objectContaining({ changeLog: true, audit: expect.objectContaining({ actor: ACTOR, input }) })],
        ]);
    });

    it.each([
        { method: "archive", count: 1 },
        { method: "archive", count: 2 },
        { method: "restore", count: 2 },
        { method: "purge", count: 2 },
    ] as const)("$method preserves realm scope and reports $count changed entities", async ({ method, count }) => {
        const { commands, departmentService, transaction, run } = helpers.commands();
        const entities = Array.from({ length: count }, () => helpers.createDepartment());
        const input = { identifiers: [ID, "another-id", "unchanged-id"], reason: "Requested change" };
        departmentService[method].mockResolvedValue(entities);

        const result = await commands[method]({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

        expect(departmentService[method].mock.calls).toEqual([
            [{ identifiers: input.identifiers, realm: REALM, transaction: transaction.entityManager }],
        ]);
        expect(result.params).toEqual(count > 1 ? { count } : undefined);
        expect(run).toHaveBeenCalledTimes(1);
    });

    it("updates only the patch within the requested realm", async () => {
        const { commands, departmentService, transaction } = helpers.commands();
        const input = { patch: { name: "Renamed" }, reason: "Correction" };

        await commands.update({ input, id: ID, realm: REALM, actor: ACTOR, context: CONTEXT });

        expect(departmentService.update.mock.calls).toEqual([
            [{ patch: input.patch, id: ID, realm: REALM, transaction: transaction.entityManager }],
        ]);
    });

    it.each([ID, null])("changes the responsible assignment to %s within the realm", async (assignment) => {
        const { commands, departmentService, transaction } = helpers.commands();

        await commands.changeManager({
            input: { assignment, reason: "Rotation" },
            id: ID,
            realm: REALM,
            actor: ACTOR,
            context: CONTEXT,
        });

        expect(departmentService.changeManager.mock.calls).toEqual([
            [{ assignment, id: ID, realm: REALM, transaction: transaction.entityManager }],
        ]);
    });

    it("propagates a domain failure through the transaction", async () => {
        const { commands, departmentService } = helpers.commands();
        const failure = new Error("domain rejected mutation");
        departmentService.archive.mockRejectedValue(failure);

        await expect(
            commands.archive({
                input: { identifiers: [ID], reason: "Requested change" },
                actor: ACTOR,
                realm: REALM,
                context: CONTEXT,
            }),
        ).rejects.toBe(failure);
    });
});
