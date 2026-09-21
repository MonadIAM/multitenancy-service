import { describe, expect, it } from "@jest/globals";

import { InviteCommandsUnitHelpers } from "~testing/unit/command-services/invite.helpers";
import { KafkaTopic } from "~context/enums";

const ACTOR = "actor-account";
const ACCOUNT = "target-account";
const REALM = "realm-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const INCOMING: TransactionManager.Service.IncomingMessage = { consumerKey: "unit-consumer", event: "incoming-event" };
const helpers = new InviteCommandsUnitHelpers();

describe("InviteCommands", () => {
    it("sets the authenticated account as inviter", async () => {
        const { commands, inviteService, transaction, run } = helpers.commands();
        const input = { organization: ID, invitee: ACCOUNT, role: "reader" };
        const invite = helpers.createInvite();
        inviteService.create.mockResolvedValue(invite);

        await commands.create({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

        expect(inviteService.create.mock.calls).toEqual([
            [{ input: { ...input, inviter: ACTOR }, realm: REALM, transaction: transaction.entityManager }],
        ]);
        expect(run.mock.calls).toEqual([
            [expect.objectContaining({ outbox: expect.objectContaining({ destinationTopic: KafkaTopic.NOTIFICATION }) })],
        ]);
    });

    it.each(["accept", "decline", "cancel"] as const)(
        "uses the actor as the correct party when processing %s",
        async (method) => {
            const { commands, inviteService, transaction } = helpers.commands();

            await commands[method]({ input: { invite: ID }, actor: ACTOR, realm: REALM, context: CONTEXT });

            expect(inviteService[method].mock.calls).toEqual([
                [
                    {
                        input: { invite: ID, ...(method === "cancel" ? { inviter: ACTOR } : { invitee: ACTOR }) },
                        realm: REALM,
                        transaction: transaction.entityManager,
                    },
                ],
            ]);
        },
    );

    it("passes invalidation scope into the transaction", async () => {
        const { commands, inviteService, transaction } = helpers.commands();
        const input = { organization: ID, account: ACCOUNT };

        await commands.invalidate({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

        expect(inviteService.invalidate.mock.calls).toEqual([
            [{ input, realm: REALM, transaction: transaction.entityManager }],
        ]);
    });

    it.each([0, 2])("expires a batch of %i invitations and skips an empty transaction", async (count) => {
        const { commands, inviteRepository, inviteService, transaction, run } = helpers.commands();
        const invites = Array.from({ length: count }, () => helpers.createInvite());
        const expirationDate = new Date("2026-01-01T00:00:00Z");
        inviteRepository.findExpiredPending.mockResolvedValue(invites);

        const result = await commands.expire({ expirationDate, batchSize: 50 });

        expect(result).toBe(count);
        expect(inviteRepository.findExpiredPending.mock.calls).toEqual([[{ expirationDate, batchSize: 50 }]]);
        if (count) {
            expect(inviteService.expire.mock.calls).toEqual([
                [{ entities: invites, at: expirationDate, transaction: transaction.entityManager }],
            ]);
        } else {
            expect(run).not.toHaveBeenCalled();
            expect(inviteService.expire).not.toHaveBeenCalled();
        }
    });

    it("consumes confirmJoin with the original process and transaction", async () => {
        const { commands, inviteService, transaction, consume } = helpers.commands();
        const request = {
            actor: ACTOR,
            realm: REALM,
            input: {
                membership: ID,
                assignment: "assignment-id",
                joinedAt: 1000,
                process: "process-id",
                command: "command-id",
                account: ACCOUNT,
                invite: "invite-id",
                role: "role-id",
                reason: "Rejected",
            },
        };
        inviteService.confirmJoin.mockResolvedValue({ access: [] });

        await commands.confirmJoin({ ...request, incoming: INCOMING });

        expect(inviteService.confirmJoin.mock.calls).toEqual([[{ ...request, transaction: transaction.entityManager }]]);
        expect(consume.mock.calls).toEqual([[expect.objectContaining({ incoming: INCOMING })]]);
    });

    it("consumes rejectJoin with the original process and transaction", async () => {
        const { commands, inviteService, transaction, consume } = helpers.commands();
        const request = {
            actor: ACTOR,
            realm: REALM,
            input: {
                membership: ID,
                assignment: "assignment-id",
                joinedAt: 1000,
                process: "process-id",
                command: "command-id",
                account: ACCOUNT,
                invite: "invite-id",
                role: "role-id",
                reason: "Rejected",
            },
        };
        inviteService.rejectJoin.mockResolvedValue(undefined);

        await commands.rejectJoin({ ...request, incoming: INCOMING });

        expect(inviteService.rejectJoin.mock.calls).toEqual([[{ ...request, transaction: transaction.entityManager }]]);
        expect(consume.mock.calls).toEqual([[expect.objectContaining({ incoming: INCOMING })]]);
    });
});
