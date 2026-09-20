import { describe, expect, it } from "@jest/globals";
import { isUUID } from "class-validator";

import { OrgMembershipStatus } from "~context/enums";

import { OrgMembership } from "./org-membership.entity";
import { Organization } from "./organization.entity";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const REALM_ID   = "00000000-0000-4000-8000-000000000002";
/* eslint-enable prettier/prettier */

function createMembership(): OrgMembership {
    const organization = new Organization({
        description: "Description",
        title: "Organization",
        realm: REALM_ID,
    });
    return new OrgMembership({ account: ACCOUNT_ID, organization });
}

describe("OrgMembership Entity", () => {
    it("should initialize an active membership", () => {
        const membership = createMembership();

        expect(isUUID(membership.id, "4")).toBe(true);
        expect(membership.status).toBe(OrgMembershipStatus.ACTIVE);
        expect(membership.joinedAt).toBeInstanceOf(Date);
    });

    it("should suspend and activate membership", () => {
        const membership = createMembership();
        const joinedAt = membership.joinedAt;
        const suspendedAt = new Date("2026-01-01T00:00:00.000Z");
        const activatedAt = new Date("2026-01-02T00:00:00.000Z");

        membership.suspend(suspendedAt);
        expect(membership.status).toBe(OrgMembershipStatus.SUSPENDED);
        expect(membership.suspendedAt).toBe(suspendedAt);

        membership.activate(activatedAt);
        expect(membership.status).toBe(OrgMembershipStatus.ACTIVE);
        expect(membership.suspendedAt).toBeUndefined();
        expect(membership.joinedAt).toBe(joinedAt);
        expect(membership.updatedAt).toBe(activatedAt);
    });

    it("should require a new join process after leaving", () => {
        const membership = createMembership();
        const leftAt = new Date("2026-01-01T00:00:00.000Z");
        membership.leave(leftAt);

        expect(() => membership.activate()).toThrow("CANNOT_ACTIVATE");

        expect(membership.status).toBe(OrgMembershipStatus.LEFT);
        expect(membership.leftAt).toBe(leftAt);
    });

    it("should clear suspension when membership leaves", () => {
        const membership = createMembership();
        membership.suspend();

        membership.leave();

        expect(membership.status).toBe(OrgMembershipStatus.LEFT);
        expect(membership.suspendedAt).toBeUndefined();
    });

    it("should preserve leftAt when a left membership is blocked", () => {
        const membership = createMembership();
        const leftAt = new Date("2026-01-01T00:00:00.000Z");
        const blockedAt = new Date("2026-01-02T00:00:00.000Z");
        membership.leave(leftAt);

        membership.block(blockedAt);

        expect(membership.status).toBe(OrgMembershipStatus.BLOCKED);
        expect(membership.leftAt).toBe(leftAt);
        expect(membership.blockedAt).toBe(blockedAt);
    });

    it("should treat blocked membership as terminal", () => {
        const membership = createMembership();
        membership.block();

        expect(() => membership.activate()).toThrow("CANNOT_ACTIVATE");
        expect(() => membership.suspend()).toThrow("CANNOT_SUSPEND");
        expect(() => membership.leave()).toThrow("CANNOT_LEAVE");
        expect(() => membership.block()).toThrow("CANNOT_BLOCK");
    });

    it("should reject invalid state transitions", () => {
        const membership = createMembership();

        expect(() => membership.activate()).toThrow("CANNOT_ACTIVATE");
        membership.leave();
        expect(() => membership.leave()).toThrow("CANNOT_LEAVE");
        expect(() => membership.suspend()).toThrow("CANNOT_SUSPEND");
    });

    it("rejects join from a blocked membership", () => {
        const membership = createMembership();
        membership.block();

        expect(() => membership.beginJoin()).toThrow("OPERATION_CONFLICT");

        expect(membership.status).toBe(OrgMembershipStatus.BLOCKED);
        expect(membership.process).toBeUndefined();
    });

    it("rejects a competing join without replacing the current process", () => {
        const membership = createMembership();
        membership.beginJoin("current");

        expect(() => membership.beginJoin("competing")).toThrow("OPERATION_CONFLICT");

        expect(membership.process).toBe("current");
        expect(membership.status).toBe(OrgMembershipStatus.JOINING);
    });

    it("rejects a late join refusal after confirmation", () => {
        const membership = createMembership();
        membership.beginJoin();
        membership.confirmJoin(new Date());

        expect(() => membership.rejectJoin("late rejection")).toThrow("OPERATION_CONFLICT");

        expect(membership.status).toBe(OrgMembershipStatus.ACTIVE);
    });
});
