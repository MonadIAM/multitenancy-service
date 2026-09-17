import { describe, expect, it } from "@jest/globals";

import { InviteStatus } from "~context/enums";

import { Organization } from "./organization.entity";
import { Invite } from "./invite.entity";

/* eslint-disable prettier/prettier */
const INVITEE_ID = "00000000-0000-4000-8000-000000000001";
const INVITER_ID = "00000000-0000-4000-8000-000000000002";
const REALM_ID   = "00000000-0000-4000-8000-000000000003";
const ROLE_ID    = "00000000-0000-4000-8000-000000000004";
/* eslint-enable prettier/prettier */

const BEFORE_EXPIRATION = new Date("2029-01-01T00:00:00.000Z");
const EXPIRES_AT = new Date("2030-01-01T00:00:00.000Z");

function createInvite(expiresAt: Optional<Date> = EXPIRES_AT): Invite {
    const organization = new Organization({
        description: "Description",
        realm: REALM_ID,
        title: "Organization",
    });
    return new Invite({
        invitee: INVITEE_ID,
        inviter: INVITER_ID,
        role: ROLE_ID,
        organization,
        expiresAt,
    });
}

describe("Invite Entity", () => {
    it("should initialize a pending invite", () => {
        const invite = createInvite();

        expect(invite.status).toBe(InviteStatus.PENDING);
        expect(invite.expiresAt).toBe(EXPIRES_AT);
        expect(invite.updatedAt).toBeUndefined();
    });

    it.each([
        ["accept", InviteStatus.ACCEPTED],
        ["decline", InviteStatus.DECLINED],
        ["cancel", InviteStatus.CANCELLED],
        ["invalidate", InviteStatus.INVALIDATED],
    ] as const)("should %s an unexpired pending invite", (method, status) => {
        const invite = createInvite();

        invite[method](BEFORE_EXPIRATION);

        expect(invite.status).toBe(status);
        expect(invite.updatedAt).toBe(BEFORE_EXPIRATION);
    });

    it("should allow an invite without expiresAt to finish", () => {
        const invite = createInvite(undefined);

        invite.accept(BEFORE_EXPIRATION);

        expect(invite.status).toBe(InviteStatus.ACCEPTED);
    });

    it("should expire a pending invite when its deadline is reached", () => {
        const invite = createInvite();

        invite.expire(EXPIRES_AT);

        expect(invite.status).toBe(InviteStatus.EXPIRED);
        expect(invite.updatedAt).toBe(EXPIRES_AT);
    });

    it("should reject terminal actions after the expiration deadline", () => {
        const invite = createInvite();

        expect(() => invite.accept(EXPIRES_AT)).toThrow("CANNOT_ACCEPT_EXPIRED");
        expect(() => invite.decline(EXPIRES_AT)).toThrow("CANNOT_DECLINE_EXPIRED");
        expect(() => invite.cancel(EXPIRES_AT)).toThrow("CANNOT_CANCEL_EXPIRED");
        expect(() => invite.invalidate(EXPIRES_AT)).toThrow("CANNOT_INVALIDATE_EXPIRED");
    });

    it("should reject expiring an invite before its deadline or without a deadline", () => {
        expect(() => createInvite().expire(BEFORE_EXPIRATION)).toThrow("CANNOT_EXPIRE_UNDUE");
        expect(() => createInvite(undefined).expire(BEFORE_EXPIRATION)).toThrow("CANNOT_EXPIRE_UNDUE");
    });

    it("should reject a second terminal transition", () => {
        const invite = createInvite();
        invite.accept(BEFORE_EXPIRATION);

        expect(() => invite.cancel(BEFORE_EXPIRATION)).toThrow("CANNOT_CANCEL_INACTIVE");
        expect(() => invite.expire(EXPIRES_AT)).toThrow("CANNOT_EXPIRE_INACTIVE");
    });
});
