import { describe, expect, it } from "@jest/globals";

import { ProjectAccountAssignmentCommandsUnitHelpers } from "~testing/unit/command-services/project-account-assignment.helpers";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const helpers = new ProjectAccountAssignmentCommandsUnitHelpers();

describe("ProjectAccountAssignmentCommands", () => {
    describe("create", () => {
        it("creates in a transaction with the required ownership scope", async () => {
            const { commands, assignmentService, transaction, run } = helpers.commands();
            const input = { membership: ID, project: "parent-id" };
            const created = helpers.createProjectAccountAssignment();
            assignmentService.create.mockResolvedValue(created);

            await commands.create({ input, actor: ACTOR, context: CONTEXT, realm: REALM });

            expect(assignmentService.create.mock.calls).toEqual([
                [{ input, transaction: transaction.entityManager, actor: ACTOR, realm: REALM }],
            ]);
            expect(run.mock.calls).toEqual([
                [expect.objectContaining({ changeLog: true, audit: expect.objectContaining({ actor: ACTOR, input }) })],
            ]);
        });
    });

    describe("revoke / restore / purge", () => {
        it.each([
            { method: "revoke", count: 1 },
            { method: "revoke", count: 2 },
            { method: "restore", count: 2 },
            { method: "purge", count: 2 },
        ] as const)("$method preserves realm scope and reports $count changed entities", async ({ method, count }) => {
            const { commands, assignmentService, transaction, run } = helpers.commands();
            const entities = Array.from({ length: count }, () => helpers.createProjectAccountAssignment());
            const input = { identifiers: [ID, "another-id", "unchanged-id"], reason: "Requested change" };
            assignmentService[method].mockResolvedValue(entities);

            const result = await commands[method]({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

            expect(assignmentService[method].mock.calls).toEqual([
                [{ identifiers: input.identifiers, realm: REALM, transaction: transaction.entityManager }],
            ]);
            expect(result.params).toEqual(count > 1 ? { count } : undefined);
            expect(run).toHaveBeenCalledTimes(1);
        });
    });

    describe("revoke", () => {
        it("propagates a domain failure through the transaction", async () => {
            const { commands, assignmentService } = helpers.commands();
            const failure = new Error("domain rejected mutation");
            assignmentService.revoke.mockRejectedValue(failure);

            await expect(
                commands.revoke({
                    input: { identifiers: [ID], reason: "Requested change" },
                    actor: ACTOR,
                    realm: REALM,
                    context: CONTEXT,
                }),
            ).rejects.toBe(failure);
        });
    });
});
