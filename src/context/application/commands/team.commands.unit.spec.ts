import { describe, expect, it } from "@jest/globals";

import { TeamCommandsUnitHelpers } from "~testing/unit/command-services/team.helpers";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const helpers = new TeamCommandsUnitHelpers();

describe("TeamCommands", () => {
    describe("create", () => {
        it("creates in a transaction with the required ownership scope", async () => {
            const { commands, teamService, transaction, run } = helpers.commands();
            const input = { department: "parent-id", name: "New entity", description: "Description" };
            const created = helpers.createTeam();
            teamService.create.mockResolvedValue(created);

            await commands.create({ input, actor: ACTOR, context: CONTEXT, realm: REALM });

            expect(teamService.create.mock.calls).toEqual([
                [{ input, transaction: transaction.entityManager, realm: REALM }],
            ]);
            expect(run.mock.calls).toEqual([
                [expect.objectContaining({ changeLog: true, audit: expect.objectContaining({ actor: ACTOR, input }) })],
            ]);
        });
    });

    describe("archive / restore / purge", () => {
        it.each([
            { method: "archive", count: 1 },
            { method: "archive", count: 2 },
            { method: "restore", count: 2 },
            { method: "purge", count: 2 },
        ] as const)("$method preserves realm scope and reports $count changed entities", async ({ method, count }) => {
            const { commands, teamService, transaction, run } = helpers.commands();
            const entities = Array.from({ length: count }, () => helpers.createTeam());
            const input = { identifiers: [ID, "another-id", "unchanged-id"], reason: "Requested change" };
            teamService[method].mockResolvedValue(entities);

            const result = await commands[method]({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

            expect(teamService[method].mock.calls).toEqual([
                [{ identifiers: input.identifiers, realm: REALM, transaction: transaction.entityManager }],
            ]);
            expect(result.params).toEqual(count > 1 ? { count } : undefined);
            expect(run).toHaveBeenCalledTimes(1);
        });
    });

    describe("update", () => {
        it("updates only the patch within the requested realm", async () => {
            const { commands, teamService, transaction } = helpers.commands();
            const input = { patch: { name: "Renamed" }, reason: "Correction" };

            await commands.update({ input, id: ID, realm: REALM, actor: ACTOR, context: CONTEXT });

            expect(teamService.update.mock.calls).toEqual([
                [{ patch: input.patch, id: ID, realm: REALM, transaction: transaction.entityManager }],
            ]);
        });
    });

    describe("changeLead", () => {
        it.each([ID, null])("changes the responsible assignment to %s within the realm", async (assignment) => {
            const { commands, teamService, transaction } = helpers.commands();

            await commands.changeLead({
                input: { assignment, reason: "Rotation" },
                id: ID,
                realm: REALM,
                actor: ACTOR,
                context: CONTEXT,
            });

            expect(teamService.changeLead.mock.calls).toEqual([
                [{ assignment, id: ID, realm: REALM, transaction: transaction.entityManager }],
            ]);
        });
    });

    describe("archive", () => {
        it("propagates a domain failure through the transaction", async () => {
            const { commands, teamService } = helpers.commands();
            const failure = new Error("domain rejected mutation");
            teamService.archive.mockRejectedValue(failure);

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
});
