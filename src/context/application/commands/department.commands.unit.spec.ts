import { describe, expect, it } from "@jest/globals";

import { DepartmentCommandsUnitHelpers } from "~testing/unit/command-services/department.helpers";
import { KafkaTopic, PositionTopicAction, MoveMode } from "~context/enums";

import { DepartmentMapper } from "../mappers/department.mapper";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ORGANIZATION = "organization-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const helpers = new DepartmentCommandsUnitHelpers();

describe("DepartmentCommands", () => {
    describe("create", () => {
        it("creates in a transaction with the required ownership scope", async () => {
            const { commands, departmentService, transaction, run } = helpers.commands();
            const input = { name: "New entity", description: "Description" };
            const created = helpers.createDepartment();
            departmentService.create.mockResolvedValue(created);

            await commands.create({
                input,
                actor: ACTOR,
                context: CONTEXT,
                realm: REALM,
                organization: ORGANIZATION,
            });

            expect(departmentService.create.mock.calls).toEqual([
                [{ input, transaction: transaction.entityManager, realm: REALM, organization: ORGANIZATION }],
            ]);
            expect(run.mock.calls).toEqual([
                [expect.objectContaining({ changeLog: true, audit: expect.objectContaining({ actor: ACTOR, input }) })],
            ]);
        });
    });

    describe("archive / restore", () => {
        it.each([
            { method: "archive", count: 1 },
            { method: "archive", count: 2 },
            { method: "restore", count: 2 },
        ] as const)(
            "$method preserves organization scope and reports $count changed entities",
            async ({ method, count }) => {
                const { commands, departmentService, transaction, run } = helpers.commands();
                const entities = Array.from({ length: count }, () => helpers.createDepartment());
                const input = { identifiers: [ID, "another-id", "unchanged-id"], reason: "Requested change" };
                departmentService[method].mockResolvedValue(entities);

                const result = await commands[method]({
                    input,
                    actor: ACTOR,
                    realm: REALM,
                    organization: ORGANIZATION,
                    context: CONTEXT,
                });

                expect(departmentService[method].mock.calls).toEqual([
                    [
                        {
                            identifiers: input.identifiers,
                            realm: REALM,
                            organization: ORGANIZATION,
                            transaction: transaction.entityManager,
                        },
                    ],
                ]);
                expect(result.params).toEqual(count > 1 ? { count } : undefined);
                expect(run).toHaveBeenCalledTimes(1);
            },
        );
    });

    describe("update", () => {
        it("updates only the patch within the requested organization", async () => {
            const { commands, departmentService, transaction } = helpers.commands();
            const input = { patch: { name: "Renamed" }, reason: "Correction" };

            await commands.update({
                input,
                id: ID,
                realm: REALM,
                organization: ORGANIZATION,
                actor: ACTOR,
                context: CONTEXT,
            });

            expect(departmentService.update.mock.calls).toEqual([
                [
                    {
                        patch: input.patch,
                        id: ID,
                        realm: REALM,
                        organization: ORGANIZATION,
                        transaction: transaction.entityManager,
                    },
                ],
            ]);
        });
    });

    describe("changeManager", () => {
        it.each([ID, null])("changes the responsible position to %s within the organization", async (position) => {
            const { commands, departmentService, transaction, run } = helpers.commands();
            const department = helpers.createDepartment();
            departmentService.changeManager.mockResolvedValue(department);

            await commands.changeManager({
                input: { position, reason: "Rotation" },
                id: ID,
                realm: REALM,
                organization: ORGANIZATION,
                actor: ACTOR,
                context: CONTEXT,
            });

            expect(departmentService.changeManager.mock.calls).toEqual([
                [{ position, id: ID, realm: REALM, organization: ORGANIZATION, transaction: transaction.entityManager }],
            ]);
            expect(run).toHaveBeenCalledWith(
                expect.objectContaining({
                    outbox: {
                        payloadMapper: DepartmentMapper.prototype.referencePayload,
                        destinationTopic: KafkaTopic.POSITION,
                        actionType: PositionTopicAction.REFERENCE_REQUESTED,
                    },
                }),
            );
            await expect(run.mock.results[0].value).resolves.toEqual({ department, actor: ACTOR, realm: REALM });
        });
    });

    describe("purge", () => {
        it("purges one department and schedules its HR cleanup in the deletion transaction", async () => {
            const { commands, departmentService, transaction, run } = helpers.commands();
            const department = helpers.createDepartment();
            const input = { reason: "Cleanup" };
            departmentService.purge.mockResolvedValue(department);

            const result = await commands.purge({
                input,
                id: department.id,
                actor: ACTOR,
                realm: REALM,
                organization: ORGANIZATION,
                context: CONTEXT,
            });

            expect(result).toEqual({ message: "commands.department.PURGED" });
            expect(departmentService.purge.mock.calls).toEqual([
                [{ id: department.id, organization: ORGANIZATION, realm: REALM, transaction: transaction.entityManager }],
            ]);
            expect(run).toHaveBeenCalledTimes(1);
            expect(run).toHaveBeenCalledWith(
                expect.objectContaining({
                    changeLog: true,
                    outbox: {
                        payloadMapper: DepartmentMapper.prototype.purgePayload,
                        actionType: PositionTopicAction.DEPARTMENT_PURGED,
                        destinationTopic: KafkaTopic.POSITION,
                    },
                }),
            );
            await expect(run.mock.results[0].value).resolves.toEqual({
                departments: [department],
                actor: ACTOR,
                realm: REALM,
            });
        });
    });

    describe("archive", () => {
        it("propagates a domain failure through the transaction", async () => {
            const { commands, departmentService } = helpers.commands();
            const failure = new Error("domain rejected mutation");
            departmentService.archive.mockRejectedValue(failure);

            const result = commands.archive({
                input: { identifiers: [ID], reason: "Requested change" },
                actor: ACTOR,
                realm: REALM,
                organization: ORGANIZATION,
                context: CONTEXT,
            });

            await expect(result).rejects.toBe(failure);
        });
    });

    describe("move", () => {
        it.each([MoveMode.SUBTREE, MoveMode.PARALLEL])(
            "audits %s restructuring without changing HR placement",
            async (mode) => {
                const { commands, departmentService, transaction, run } = helpers.commands();
                const input = { target: ID, targetParent: null, mode, reason: "Reorganization" };
                departmentService.move.mockResolvedValue(undefined);

                await commands.move({
                    input,
                    actor: ACTOR,
                    realm: REALM,
                    organization: ORGANIZATION,
                    context: CONTEXT,
                });

                expect(departmentService.move).toHaveBeenCalledWith({
                    ...input,
                    realm: REALM,
                    organization: ORGANIZATION,
                    transaction: transaction.entityManager,
                });
                expect(run).toHaveBeenCalledWith(
                    expect.objectContaining({ changeLog: true, audit: expect.objectContaining({ actor: ACTOR, input }) }),
                );
                expect(run.mock.calls[0][0].outbox).toBeUndefined();
            },
        );
    });
});
