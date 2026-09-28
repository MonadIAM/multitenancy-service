import { describe, expect, it } from "@jest/globals";

import { EntityFactoryRegistry } from "~testing/entity-factory.registry";

import { InviteMapper } from "./invite.mapper";

const helpers = new EntityFactoryRegistry();
const mapper = new InviteMapper();

describe("InviteMapper", () => {
    describe("joinPayload", () => {
        it.each(["selected-role", undefined])("maps invitation acceptance with role %s", (role) => {
            const invite = helpers.createInvite({ role });
            const membership = helpers.createOrgMembership({ organization: invite.organization, account: invite.invitee });
            membership.beginJoin();

            const payload = mapper.joinPayload({ invite, membership });

            expect(payload.actor).toBe(invite.inviter);
            expect(payload.input.role).toBe(role);
            expect(payload.input.invite).toBe(invite.id);
            expect(payload.input.membership).toBe(membership.id);
            expect(payload.input.account).toBe(invite.invitee);
        });
    });

    describe("notificationPayload", () => {
        it("provides all invitation template parameters and a stable deduplication key", () => {
            const invite = helpers.createInvite();

            const payload = mapper.notificationPayload(invite);

            expect(payload.input).toEqual(
                expect.objectContaining({
                    dedupKey: `invite:${invite.id}`,
                    recipient: invite.invitee,
                    params: { inviter: invite.inviter, realm: invite.organization.title },
                }),
            );
        });
    });
});
