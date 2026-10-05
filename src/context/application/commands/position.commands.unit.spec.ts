import { describe, expect, it } from "@jest/globals";

import { PositionReferenceType, PositionTopicAction, KafkaTopic, ActionType, EntityType } from "~context/enums";
import { PositionCommandsUnitHelpers } from "~testing/unit/command-services/position.helpers";
import { CONSUMER_META } from "~context/constants";
import { Exception } from "~common/exceptions";

import { PositionMapper } from "../mappers/position.mapper";

const INCOMING: TransactionManager.Service.IncomingMessage = { consumerKey: "unit-consumer", event: "incoming-event" };
const REQUEST: Topics.Position.PlacementRequestedMessage["payload"] = {
    actor: "actor-account",
    realm: "organization-realm",
    input: {
        organization: "organization-a",
        department: "department-a",
        team: "team-a",
        position: "position-a",
        process: "placement-process",
    },
};
const helpers = new PositionCommandsUnitHelpers();

describe("PositionCommands", () => {
    describe("validatePlacement", () => {
        it("validates the placement and schedules a correlated confirmation in the incoming transaction", async () => {
            const { commands, positionService, consume, transaction } = helpers.commands();

            await commands.validatePlacement({ incoming: INCOMING, ...REQUEST });

            expect(positionService.validatePlacement.mock.calls).toEqual([
                [{ ...REQUEST, transaction: transaction.entityManager }],
            ]);
            expect(consume.mock.calls).toEqual([
                [
                    expect.objectContaining({
                        incoming: INCOMING,
                        resource: "Position",
                        changeLog: true,
                        audit: {
                            entityType: EntityType.POSITION,
                            actionType: ActionType.UPDATE,
                            context: CONSUMER_META,
                            ...REQUEST,
                        },
                        outbox: {
                            payloadMapper: PositionMapper.prototype.confirmed,
                            actionType: PositionTopicAction.PLACEMENT_CONFIRMED,
                            destinationTopic: KafkaTopic.POSITION,
                        },
                    }),
                ],
            ]);
            await expect(consume.mock.results[0].value).resolves.toEqual({
                status: "processed",
                value: { request: REQUEST },
            });
        });

        it("turns a business refusal into a rejection with the original process and reason", async () => {
            const { commands, positionService, consume } = helpers.commands();
            const error = Exception.notFound({ messageKey: "placement not found" });
            positionService.validatePlacement.mockRejectedValue(error);

            await commands.validatePlacement({ incoming: INCOMING, ...REQUEST });

            expect(consume).toHaveBeenCalledTimes(2);
            expect(consume).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    payload: { ...REQUEST, input: { ...REQUEST.input, reason: error.message } },
                    actionType: PositionTopicAction.PLACEMENT_REJECTED,
                    destinationTopic: KafkaTopic.POSITION,
                    incoming: INCOMING,
                }),
            );
        });

        it.each([
            { name: "retryable dependency failure", error: Exception.externalServiceFailed({ messageKey: "unavailable" }) },
            { name: "unexpected failure", error: new Error("unexpected") },
        ])("propagates $name without consuming a rejection", async ({ error }) => {
            const { commands, positionService, consume } = helpers.commands();
            positionService.validatePlacement.mockRejectedValue(error);

            await expect(commands.validatePlacement({ incoming: INCOMING, ...REQUEST })).rejects.toBe(error);

            expect(consume).toHaveBeenCalledTimes(1);
        });

        it("does not validate a message already claimed by the inbox", async () => {
            const { commands, positionService, consume } = helpers.commands();
            consume.mockResolvedValue({ status: "duplicate" });

            await commands.validatePlacement({ incoming: INCOMING, ...REQUEST });

            expect(positionService.validatePlacement).not.toHaveBeenCalled();
            expect(consume).toHaveBeenCalledTimes(1);
        });
    });

    describe("rejectPlacement", () => {
        it("records a terminal rejection and its audit without repeating domain validation", async () => {
            const { commands, positionService, consume } = helpers.commands();
            const reason = "retries exhausted";

            await commands.rejectPlacement({ incoming: INCOMING, request: REQUEST, reason });

            expect(positionService.validatePlacement).not.toHaveBeenCalled();
            expect(consume.mock.calls).toEqual([
                [
                    {
                        incoming: INCOMING,
                        resource: "Position",
                        payload: { ...REQUEST, input: { ...REQUEST.input, reason } },
                        destinationTopic: KafkaTopic.POSITION,
                        actionType: PositionTopicAction.PLACEMENT_REJECTED,
                        audit: {
                            input: { request: REQUEST, reason },
                            entityType: EntityType.POSITION,
                            actionType: ActionType.UPDATE,
                            context: CONSUMER_META,
                            actor: REQUEST.actor,
                            realm: REQUEST.realm,
                        },
                    },
                ],
            ]);
        });

        it("propagates a failure to persist the rejection", async () => {
            const { commands, consume } = helpers.commands();
            const error = new Error("outbox unavailable");
            consume.mockRejectedValue(error);

            await expect(
                commands.rejectPlacement({ incoming: INCOMING, request: REQUEST, reason: "refused" }),
            ).rejects.toBe(error);

            expect(consume).toHaveBeenCalledTimes(1);
        });
    });

    describe("completeReference", () => {
        it.each([
            { type: PositionReferenceType.DEPARTMENT_MANAGER, rejected: false },
            { type: PositionReferenceType.DEPARTMENT_MANAGER, rejected: true },
            { type: PositionReferenceType.TEAM_LEAD, rejected: false },
            { type: PositionReferenceType.TEAM_LEAD, rejected: true },
        ])("completes $type with rejected=$rejected using the response correlation", async ({ type, rejected }) => {
            const { commands, positionService, consume, transaction } = helpers.commands();
            const request: Topics.Position.ReferenceRequestedMessage["payload"] = {
                actor: REQUEST.actor,
                realm: REQUEST.realm,
                input:
                    type === PositionReferenceType.TEAM_LEAD
                        ? { ...REQUEST.input, type }
                        : {
                              organization: REQUEST.input.organization,
                              department: REQUEST.input.department,
                              position: REQUEST.input.position,
                              process: REQUEST.input.process,
                              type,
                          },
            };

            await commands.completeReference({ incoming: INCOMING, ...request, rejected });

            expect(positionService.completeReference.mock.calls).toEqual([
                [{ ...request, transaction: transaction.entityManager, rejected }],
            ]);
            expect(consume).toHaveBeenCalledTimes(1);
            expect(consume).toHaveBeenCalledWith(
                expect.objectContaining({
                    incoming: INCOMING,
                    changeLog: true,
                    audit: expect.objectContaining({ ...request, context: CONSUMER_META }),
                }),
            );
            expect(consume.mock.calls[0][0]).not.toHaveProperty("outbox");
        });
    });

    describe("release", () => {
        it("removes references for the event positions within their organization", async () => {
            const { commands, positionService, consume, transaction } = helpers.commands();
            const request: Topics.Position.LifecycleMessage["payload"] = {
                input: { organization: REQUEST.input.organization, positions: ["position-a", "position-b"] },
                actor: REQUEST.actor,
                realm: REQUEST.realm,
            };

            await commands.release({ incoming: INCOMING, ...request });

            expect(positionService.release.mock.calls).toEqual([[{ ...request, transaction: transaction.entityManager }]]);
            expect(consume).toHaveBeenCalledTimes(1);
            expect(consume).toHaveBeenCalledWith(
                expect.objectContaining({
                    incoming: INCOMING,
                    changeLog: true,
                    audit: expect.objectContaining({ ...request, context: CONSUMER_META }),
                }),
            );
            expect(consume.mock.calls[0][0]).not.toHaveProperty("outbox");
        });

        it("propagates cleanup failure so the consumer can retry", async () => {
            const { commands, positionService, consume } = helpers.commands();
            const error = new Error("cleanup unavailable");
            positionService.release.mockRejectedValue(error);
            const request = {
                input: { organization: REQUEST.input.organization, positions: ["position-a"] },
                actor: REQUEST.actor,
                realm: REQUEST.realm,
            };

            await expect(commands.release({ incoming: INCOMING, ...request })).rejects.toBe(error);

            expect(consume).toHaveBeenCalledTimes(1);
        });
    });
});
