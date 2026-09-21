import { describe, expect, it } from "@jest/globals";

import { OrgMembershipCommandsUnitHelpers } from "~testing/unit/command-services/org-membership.helpers";
import { KafkaTopic, RealmTopicAction } from "~context/enums";

const ACTOR = "actor-account";
const ACCOUNT = "target-account";
const REALM = "realm-a";
const ID = "entity-a";
const CONTEXT: Extract.Meta = { ip: "127.0.0.1", userAgent: "unit-test" };
const helpers = new OrgMembershipCommandsUnitHelpers();

describe("OrgMembershipCommands", () => {
    it("joins in a transaction with the required ownership scope", async () => {
        const { commands, membershipService, transaction, run } = helpers.commands();
        const input = { organization: ID, account: ACCOUNT };
        const created = helpers.createOrgMembership();
        membershipService.join.mockResolvedValue(created);

        await commands.join({ input, actor: ACTOR, context: CONTEXT, realm: REALM });

        expect(membershipService.join.mock.calls).toEqual([
            [{ input, transaction: transaction.entityManager, realm: REALM }],
        ]);
        expect(run.mock.calls).toEqual([
            [expect.objectContaining({ changeLog: true, audit: expect.objectContaining({ actor: ACTOR, input }) })],
        ]);
    });

    it.each([
        { method: "suspend", count: 1 },
        { method: "suspend", count: 2 },
        { method: "resume", count: 2 },
        { method: "leave", count: 2 },
        { method: "block", count: 2 },
    ] as const)("$method preserves realm scope and reports $count changed entities", async ({ method, count }) => {
        const { commands, membershipService, transaction, run } = helpers.commands();
        const entities = Array.from({ length: count }, () => helpers.createOrgMembership());
        const input = { identifiers: [ID, "another-id", "unchanged-id"], reason: "Requested change" };
        membershipService[method].mockResolvedValue({
            memberships: entities,
            access: [{ realm: REALM, account: ACCOUNT }],
            assignments: { department: [], team: [], project: [] },
        });

        const result = await commands[method]({ input, actor: ACTOR, realm: REALM, context: CONTEXT });

        expect(membershipService[method].mock.calls).toEqual([
            [
                {
                    identifiers: input.identifiers,
                    realm: REALM,
                    transaction: transaction.entityManager,
                    ...(method === "leave" ? { account: ACTOR } : {}),
                },
            ],
        ]);
        expect(result.params).toEqual(count > 1 ? { count } : undefined);
        expect(run).toHaveBeenCalledTimes(1);
        await expect(run.mock.results[0]?.value).resolves.toEqual({
            ...{
                memberships: entities,
                access: [{ realm: REALM, account: ACCOUNT }],
                assignments: { department: [], team: [], project: [] },
            },
            actor: ACTOR,
        });
        expect(run.mock.calls).toEqual([
            [
                expect.objectContaining({
                    outbox: expect.objectContaining({
                        destinationTopic: KafkaTopic.REALM,
                        actionType:
                            method === "suspend"
                                ? RealmTopicAction.ACCOUNT_ACCESS_REVOKE
                                : method === "resume"
                                  ? RealmTopicAction.ACCOUNT_ACCESS_RESTORE
                                  : RealmTopicAction.ACCOUNT_ACCESS_PURGE,
                    }),
                }),
            ],
        ]);
    });

    it("propagates a domain failure through the transaction", async () => {
        const { commands, membershipService } = helpers.commands();
        const failure = new Error("domain rejected mutation");
        membershipService.suspend.mockRejectedValue(failure);

        await expect(
            commands.suspend({
                input: { identifiers: [ID], reason: "Requested change" },
                actor: ACTOR,
                realm: REALM,
                context: CONTEXT,
            }),
        ).rejects.toBe(failure);
    });
});
