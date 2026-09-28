import { describe, expect, it } from "@jest/globals";

import { OrganizationCommandsUnitHelpers } from "~testing/unit/command-services/organization.helpers";
import { KafkaTopic, RealmTopicAction, RealmType } from "~context/enums";

const ACTOR = "actor-account";
const ACCOUNT = "target-account";
const REALM = "realm-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const INCOMING: TransactionManager.Service.IncomingMessage = { consumerKey: "unit-consumer", event: "incoming-event" };
const helpers = new OrganizationCommandsUnitHelpers();

describe("OrganizationCommands", () => {
    describe("create", () => {
        it("creates in a transaction with the required ownership scope", async () => {
            const { commands, organizationService, transaction, run } = helpers.commands();
            const input = { title: "New organization", description: "Description" };
            const created = { organization: helpers.createOrganization(), membership: helpers.createOrgMembership() };
            organizationService.create.mockReturnValue(created);

            await commands.create({ input, actor: ACTOR, context: CONTEXT });

            expect(organizationService.create.mock.calls).toEqual([
                [{ input, transaction: transaction.entityManager, actor: ACTOR }],
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
            const { commands, organizationService, transaction, run } = helpers.commands();
            const entities = Array.from({ length: count }, () => helpers.createOrganization());
            const input = { identifiers: [ID, "another-id", "unchanged-id"], reason: "Requested change" };
            organizationService[method].mockResolvedValue({ organizations: entities, realms: [{ realm: REALM }] });

            const result = await commands[method]({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

            expect(organizationService[method].mock.calls).toEqual([
                [{ identifiers: input.identifiers, realm: REALM, transaction: transaction.entityManager }],
            ]);
            expect(result.params).toEqual(count > 1 ? { count } : undefined);
            expect(run).toHaveBeenCalledTimes(1);
            await expect(run.mock.results[0]?.value).resolves.toEqual({
                ...{ organizations: entities, realms: [{ realm: REALM }] },
                actor: ACTOR,
            });
            expect(run.mock.calls).toEqual([
                [
                    expect.objectContaining({
                        outbox: expect.objectContaining({
                            destinationTopic: KafkaTopic.REALM,
                            actionType:
                                method === "restore"
                                    ? RealmTopicAction.SYSTEM_RESTORE
                                    : method === "purge"
                                      ? RealmTopicAction.SYSTEM_PURGE
                                      : RealmTopicAction.SYSTEM_REVOKE,
                        }),
                    }),
                ],
            ]);
        });
    });

    describe("update", () => {
        it("updates only the patch within the requested realm", async () => {
            const { commands, organizationService, transaction } = helpers.commands();
            const input = { patch: { title: "Renamed" }, reason: "Correction" };

            await commands.update({ input, id: ID, realm: REALM, actor: ACTOR, context: CONTEXT });

            expect(organizationService.update.mock.calls).toEqual([
                [{ patch: input.patch, id: ID, realm: REALM, transaction: transaction.entityManager }],
            ]);
        });
    });

    describe("revoke", () => {
        it("propagates a domain failure through the transaction", async () => {
            const { commands, organizationService } = helpers.commands();
            const failure = new Error("domain rejected mutation");
            organizationService.revoke.mockRejectedValue(failure);

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

    describe("confirmBootstrap", () => {
        it("consumes confirmBootstrap with the original process and transaction", async () => {
            const { commands, organizationService, transaction, consume } = helpers.commands();
            const request = {
                actor: ACTOR,
                realm: REALM,
                input: { type: RealmType.ORGANIZATION as const, resource: ID, process: "process-id", reason: "Rejected" },
            };
            organizationService.confirmBootstrap.mockResolvedValue({ realms: [] });

            await commands.confirmBootstrap({ ...request, incoming: INCOMING });

            expect(organizationService.confirmBootstrap.mock.calls).toEqual([
                [{ ...request, transaction: transaction.entityManager }],
            ]);
            expect(consume.mock.calls).toEqual([[expect.objectContaining({ incoming: INCOMING })]]);
        });
    });

    describe("rejectBootstrap", () => {
        it("consumes rejectBootstrap with the original process and transaction", async () => {
            const { commands, organizationService, transaction, consume } = helpers.commands();
            const request = {
                actor: ACTOR,
                realm: REALM,
                input: { type: RealmType.ORGANIZATION as const, resource: ID, process: "process-id", reason: "Rejected" },
            };
            organizationService.rejectBootstrap.mockResolvedValue(undefined);

            await commands.rejectBootstrap({ ...request, incoming: INCOMING });

            expect(organizationService.rejectBootstrap.mock.calls).toEqual([
                [{ ...request, transaction: transaction.entityManager }],
            ]);
            expect(consume.mock.calls).toEqual([[expect.objectContaining({ incoming: INCOMING })]]);
        });
    });

    describe("confirmTransfer", () => {
        it("consumes confirmTransfer with the original process and transaction", async () => {
            const { commands, organizationService, transaction, consume } = helpers.commands();
            const request = {
                actor: ACTOR,
                realm: REALM,
                input: {
                    organization: ID,
                    previousOwner: ACTOR,
                    owner: ACCOUNT,
                    process: "process-id",
                    reason: "Rejected",
                },
            };
            organizationService.confirmTransfer.mockResolvedValue({ realms: [] });

            await commands.confirmTransfer({ ...request, incoming: INCOMING });

            expect(organizationService.confirmTransfer.mock.calls).toEqual([
                [{ ...request, transaction: transaction.entityManager }],
            ]);
            expect(consume.mock.calls).toEqual([[expect.objectContaining({ incoming: INCOMING })]]);
        });
    });

    describe("rejectTransfer", () => {
        it("consumes rejectTransfer with the original process and transaction", async () => {
            const { commands, organizationService, transaction, consume } = helpers.commands();
            const request = {
                actor: ACTOR,
                realm: REALM,
                input: {
                    organization: ID,
                    previousOwner: ACTOR,
                    owner: ACCOUNT,
                    process: "process-id",
                    reason: "Rejected",
                },
            };
            organizationService.rejectTransfer.mockResolvedValue(undefined);

            await commands.rejectTransfer({ ...request, incoming: INCOMING });

            expect(organizationService.rejectTransfer.mock.calls).toEqual([
                [{ ...request, transaction: transaction.entityManager }],
            ]);
            expect(consume.mock.calls).toEqual([[expect.objectContaining({ incoming: INCOMING })]]);
        });
    });

    describe("transferOwnership", () => {
        it("binds an ownership transfer to the requested membership, realm and actor", async () => {
            const { commands, organizationService, transaction, run } = helpers.commands();
            const transfer = { organization: helpers.createOrganization(), previousOwner: ACTOR, owner: ACCOUNT };
            organizationService.transferOwnership.mockResolvedValue(transfer);

            await commands.transferOwnership({
                input: { membership: ID, reason: "New owner" },
                actor: ACTOR,
                realm: REALM,
                id: "organization-id",
                context: CONTEXT,
            });

            expect(organizationService.transferOwnership.mock.calls).toEqual([
                [{ membership: ID, id: "organization-id", realm: REALM, transaction: transaction.entityManager }],
            ]);
            await expect(run.mock.results[0]?.value).resolves.toEqual({ ...transfer, actor: ACTOR });
            expect(run.mock.calls).toEqual([
                [
                    expect.objectContaining({
                        outbox: expect.objectContaining({ actionType: RealmTopicAction.TRANSFER_OWNERSHIP_REQUESTED }),
                    }),
                ],
            ]);
        });
    });
});
