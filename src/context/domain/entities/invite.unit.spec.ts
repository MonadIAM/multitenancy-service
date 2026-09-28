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

function createInvite(props: Partial<Entities.Invite.ConstructorProps> = {}): Invite {
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
        expiresAt: EXPIRES_AT,
        ...props,
    });
}

describe("Invite Entity", () => {
    describe("constructor", () => {
        it("should initialize a pending invite", () => {
            const invite = createInvite();

            expect(invite.status).toBe(InviteStatus.PENDING);
            expect(invite.expiresAt).toBe(EXPIRES_AT);
            expect(invite.updatedAt).toBeUndefined();
        });
    });

    describe("state transitions", () => {
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

        it.each([
            { method: "accept", error: "CANNOT_ACCEPT_EXPIRED" },
            { method: "decline", error: "CANNOT_DECLINE_EXPIRED" },
            { method: "cancel", error: "CANNOT_CANCEL_EXPIRED" },
            { method: "invalidate", error: "CANNOT_INVALIDATE_EXPIRED" },
        ] as const)("should reject $method at the expiration deadline", ({ method, error }) => {
            const invite = createInvite();

            expect(() => invite[method](EXPIRES_AT)).toThrow(error);
        });

        it("should reject a second terminal transition", () => {
            const invite = createInvite();
            invite.accept(BEFORE_EXPIRATION);

            expect(() => invite.cancel(BEFORE_EXPIRATION)).toThrow("CANNOT_CANCEL_INACTIVE");
            expect(() => invite.expire(EXPIRES_AT)).toThrow("CANNOT_EXPIRE_INACTIVE");
        });
    });

    describe("accept", () => {
        it("should allow an invite without expiresAt to finish", () => {
            const invite = createInvite({ expiresAt: undefined });

            invite.accept(BEFORE_EXPIRATION);

            expect(invite.status).toBe(InviteStatus.ACCEPTED);
        });
    });

    describe("expire", () => {
        it("should expire a pending invite when its deadline is reached", () => {
            const invite = createInvite();

            invite.expire(EXPIRES_AT);

            expect(invite.status).toBe(InviteStatus.EXPIRED);
            expect(invite.updatedAt).toBe(EXPIRES_AT);
        });

        it.each([
            { scenario: "before its deadline", expiresAt: EXPIRES_AT },
            { scenario: "without a deadline", expiresAt: undefined },
        ])("should reject expiring an invite $scenario", ({ expiresAt }) => {
            const invite = createInvite({ expiresAt });

            expect(() => invite.expire(BEFORE_EXPIRATION)).toThrow("CANNOT_EXPIRE_UNDUE");
        });
    });

    describe("confirmAccept", () => {
        it("rejects completion of an invitation that is not being accepted", () => {
            const invite = createInvite();

            expect(() => invite.confirmAccept()).toThrow("OPERATION_CONFLICT");

            expect(invite.status).toBe(InviteStatus.PENDING);
        });
    });

    describe("rejectAccept", () => {
        it("rejects late acceptance failure after confirmation", () => {
            const invite = createInvite();
            invite.beginAccept("process");
            invite.confirmAccept();

            expect(() => invite.rejectAccept("late rejection")).toThrow("OPERATION_CONFLICT");

            expect(invite.status).toBe(InviteStatus.ACCEPTED);
        });
    });
});
