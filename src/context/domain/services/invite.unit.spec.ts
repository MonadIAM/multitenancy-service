import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { InviteUnitHelpers } from "~testing/unit/domain-service/invite.helpers";
import { InviteStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID        = "00000000-0000-4000-8000-100000000001";
const ORGANIZATION_ID = "00000000-0000-4000-8000-100000000002";
const INVITE_ID       = "00000000-0000-4000-8000-100000000003";
const INVITEE_ID      = "00000000-0000-4000-8000-100000000004";
const INVITER_ID      = "00000000-0000-4000-8000-100000000005";
const ROLE_ID         = "00000000-0000-4000-8000-100000000006";
/* eslint-enable prettier/prettier */

const helpers = new InviteUnitHelpers();

describe("InviteService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates an invite only when the invitee is not an active member", async () => {
        const organization = helpers.createOrganization({
            id: ORGANIZATION_ID,
            realm: REALM_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            organizations: [organization],
        });
        repositories.memberships.findUnique.mockImplementation(() => Promise.resolve(null));

        const result = await service.create({
            input: {
                organization: ORGANIZATION_ID,
                invitee: INVITEE_ID,
                inviter: INVITER_ID,
                role: ROLE_ID,
            },
            transaction: transaction.entityManager,
            realm: REALM_ID,
        });

        expect(result.organization).toBe(organization);
        expect(transaction.persist).toHaveBeenCalledWith(result);

        repositories.memberships.findUnique.mockImplementation(() => Promise.resolve(helpers.createOrgMembership()));

        await expect(
            service.create({
                input: {
                    organization: ORGANIZATION_ID,
                    invitee: INVITEE_ID,
                    inviter: INVITER_ID,
                    role: ROLE_ID,
                },
                transaction: transaction.entityManager,
                realm: REALM_ID,
            }),
        ).rejects.toThrow("services.invite.INVITEE_ALREADY_MEMBER");
    });

    it("accepts an invite and delegates membership creation to the domain service", async () => {
        const invite = helpers.createInvite({
            id: INVITE_ID,
            invitee: INVITEE_ID,
        });
        const membership = helpers.createOrgMembership({
            organization: invite.organization,
            account: INVITEE_ID,
        });
        const { service, repositories, services, transaction } = helpers.service({ invites: [invite] });
        repositories.invites.findUniqueOrThrow.mockImplementation(() => Promise.resolve(invite));
        membership.beginJoin();
        services.memberships.join.mockImplementation(() => Promise.resolve(membership));

        await expect(
            service.accept({
                input: { invite: INVITE_ID, invitee: INVITEE_ID },
                transaction: transaction.entityManager,
                realm: REALM_ID,
            }),
        ).resolves.toEqual({ invite, membership });

        expect(invite.status).toBe(InviteStatus.ACCEPTING);
        expect(services.memberships.join).toHaveBeenCalledWith({
            input: {
                organization: invite.organization.id,
                account: INVITEE_ID,
            },
            transaction: transaction.entityManager,
            realm: REALM_ID,
        });
    });

    it("declines and cancels invites with actor-specific repository scopes", async () => {
        const invite = helpers.createInvite({
            id: INVITE_ID,
            invitee: INVITEE_ID,
            inviter: INVITER_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            invites: [invite],
        });
        repositories.invites.findUniqueOrThrow.mockImplementation(() => Promise.resolve(invite));

        await service.decline({
            input: { invite: INVITE_ID, invitee: INVITEE_ID },
            transaction: transaction.entityManager,
            realm: REALM_ID,
        });

        expect(invite.status).toBe(InviteStatus.DECLINED);

        const pending = helpers.createInvite({
            id: INVITE_ID,
            inviter: INVITER_ID,
        });
        repositories.invites.findUniqueOrThrow.mockImplementation(() => Promise.resolve(pending));

        await service.cancel({
            input: { invite: INVITE_ID, inviter: INVITER_ID },
            transaction: transaction.entityManager,
            realm: REALM_ID,
        });

        expect(pending.status).toBe(InviteStatus.CANCELLED);
    });

    it("requires invalidate scope and invalidates all selected pending invites", async () => {
        const first = helpers.createInvite();
        const second = helpers.createInvite();
        const { service, repositories, transaction } = helpers.service({
            invites: [first, second],
        });

        await expect(
            service.invalidate({
                input: {},
                transaction: transaction.entityManager,
                realm: REALM_ID,
            }),
        ).rejects.toThrow("services.invite.INVALIDATION_SCOPE_REQUIRED");

        await expect(
            service.invalidate({
                input: { account: INVITEE_ID },
                transaction: transaction.entityManager,
                realm: REALM_ID,
            }),
        ).resolves.toEqual([first, second]);

        expect(first.status).toBe(InviteStatus.INVALIDATED);
        expect(second.status).toBe(InviteStatus.INVALIDATED);
        expect(repositories.invites.find).toHaveBeenCalledWith({
            where: {
                organization: { realm: REALM_ID },
                status: InviteStatus.PENDING,
                $or: [{ invitee: INVITEE_ID }, { inviter: INVITEE_ID }],
            },
            transaction: transaction.entityManager,
        });
    });

    it("merges and expires provided invites at the supplied time", () => {
        const at = new Date("2030-01-01T00:00:00.000Z");
        const invite = helpers.createInvite({
            expiresAt: new Date("2029-01-01T00:00:00.000Z"),
        });
        const { service, transaction } = helpers.service();

        service.expire({
            entities: [invite],
            transaction: transaction.entityManager,
            at,
        });

        expect(transaction.merge).toHaveBeenCalledWith(invite);
        expect(invite.status).toBe(InviteStatus.EXPIRED);
    });
});
