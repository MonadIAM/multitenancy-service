import { describe, expect, it } from "@jest/globals";

import { TeamCommandsUnitHelpers } from "~testing/unit/command-services/team.helpers";
import { KafkaTopic, PositionTopicAction } from "~context/enums";

import { TeamMapper } from "../mappers/team.mapper";

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
        it.each([ID, null])("changes the responsible position to %s within the realm", async (position) => {
            const { commands, teamService, transaction, run } = helpers.commands();
            const team = helpers.createTeam();
            teamService.changeLead.mockResolvedValue(team);

            await commands.changeLead({
                input: { position, reason: "Rotation" },
                id: ID,
                realm: REALM,
                actor: ACTOR,
                context: CONTEXT,
            });

            expect(teamService.changeLead.mock.calls).toEqual([
                [{ position, id: ID, realm: REALM, transaction: transaction.entityManager }],
            ]);
            expect(run).toHaveBeenCalledWith(
                expect.objectContaining({
                    outbox: {
                        payloadMapper: TeamMapper.prototype.referencePayload,
                        destinationTopic: KafkaTopic.POSITION,
                        actionType: PositionTopicAction.REFERENCE_REQUESTED,
                    },
                }),
            );
            await expect(run.mock.results[0].value).resolves.toEqual({ team, actor: ACTOR, realm: REALM });
        });
    });

    describe("purge", () => {
        it("schedules HR cleanup for the removed entities in the deletion transaction", async () => {
            const { commands, teamService, run } = helpers.commands();
            const teams = [helpers.createTeam(), helpers.createTeam()];
            const input = { identifiers: teams.map((entity) => entity.id), reason: "Cleanup" };
            teamService.purge.mockResolvedValue(teams);

            await commands.purge({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

            expect(run).toHaveBeenCalledTimes(1);
            expect(run).toHaveBeenCalledWith(
                expect.objectContaining({
                    changeLog: true,
                    outbox: {
                        payloadMapper: TeamMapper.prototype.purgePayload,
                        destinationTopic: KafkaTopic.POSITION,
                        actionType: PositionTopicAction.TEAM_PURGED,
                    },
                }),
            );
            await expect(run.mock.results[0].value).resolves.toEqual({ teams, actor: ACTOR, realm: REALM });
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
