import { describe, expect, it } from "@jest/globals";
import { isUUID } from "class-validator";

import { OrganizationStatus } from "~context/enums";

import { Organization } from "./organization.entity";
import { Membership } from "./membership.entity";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const REALM_ID   = "00000000-0000-4000-8000-000000000002";
/* eslint-enable prettier/prettier */

function createOrganization(): Organization {
    return new Organization({
        description: "Description",
        title: "Organization",
        realm: REALM_ID,
    });
}

function createMembership(organization: Organization): Membership {
    return new Membership({ account: ACCOUNT_ID, organization });
}

describe("Organization Entity", () => {
    describe("constructor", () => {
        it("should initialize an active organization", () => {
            const organization = createOrganization();

            expect(isUUID(organization.id, "4")).toBe(true);
            expect(organization.status).toBe(OrganizationStatus.ACTIVE);
            expect(organization.createdAt).toBeInstanceOf(Date);
            expect(organization.version).toBe(1);
        });
    });

    describe("transferOwnership", () => {
        it("should transfer ownership", () => {
            const organization = createOrganization();
            const membership = createMembership(organization);

            organization.transferOwnership({ membership });

            expect(organization.owner).toBe(membership);
            expect(organization.updatedAt).toBeInstanceOf(Date);
        });

        it("should reject transferring ownership to the current owner", () => {
            const organization = createOrganization();
            const membership = createMembership(organization);
            organization.transferOwnership({ membership });

            expect(() => organization.transferOwnership({ membership })).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("update", () => {
        it("should update mutable metadata", () => {
            const organization = createOrganization();

            organization.update({
                patch: { description: "Updated", title: "Updated organization" },
            });

            expect(organization.description).toBe("Updated");
            expect(organization.title).toBe("Updated organization");
            expect(organization.updatedAt).toBeInstanceOf(Date);
        });

        it("should reject empty and unchanged metadata updates", () => {
            const organization = createOrganization();

            expect(() => organization.update({ patch: {} })).toThrow("EMPTY_UPDATE_PATCH");
            expect(() => organization.update({ patch: { title: organization.title } })).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("revoke / restore / canPurge", () => {
        it("should revoke and restore organization", () => {
            const organization = createOrganization();

            organization.revoke();
            expect(organization.status).toBe(OrganizationStatus.REVOKED);
            expect(organization.revokedAt).toBeInstanceOf(Date);

            organization.restore();
            expect(organization.status).toBe(OrganizationStatus.ACTIVE);
            expect(organization.revokedAt).toBeUndefined();
        });

        it("should reject duplicate lifecycle transitions", () => {
            const organization = createOrganization();
            expect(() => organization.restore()).toThrow("ALREADY_ACTIVE");

            organization.revoke();
            expect(() => organization.revoke()).toThrow("ALREADY_REVOKED");
        });

        it("should allow purging only a revoked organization", () => {
            const organization = createOrganization();

            expect(() => organization.canPurge()).toThrow("CANNOT_PURGE_ACTIVE");
            organization.revoke();
            expect(() => organization.canPurge()).not.toThrow();
        });
    });
});
