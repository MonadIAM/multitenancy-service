import { describe, expect, it } from "@jest/globals";
import { isUUID } from "class-validator";

import { AssignmentStatus } from "~context/enums";

import { DeptAccountAssignment } from "./dept-account-assignment.entity";
import { OrgMembership } from "./org-membership.entity";
import { Organization } from "./organization.entity";
import { Department } from "./department.entity";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const ACTOR_ID   = "00000000-0000-4000-8000-000000000002";
const REALM_ID   = "00000000-0000-4000-8000-000000000003";
/* eslint-enable prettier/prettier */

function createAssignment(): DeptAccountAssignment {
    const organization = new Organization({
        description: "Description",
        realm: REALM_ID,
        title: "Organization",
    });
    const membership = new OrgMembership({ account: ACCOUNT_ID, organization });
    const department = new Department({
        description: "Description",
        name: "Department",
        organization,
    });
    return new DeptAccountAssignment({
        assignedBy: ACTOR_ID,
        department,
        membership,
    });
}

describe("DeptAccountAssignment Entity", () => {
    it("should initialize an active immutable assignment", () => {
        const assignment = createAssignment();

        expect(isUUID(assignment.id, "4")).toBe(true);
        expect(assignment.status).toBe(AssignmentStatus.ACTIVE);
        expect(assignment.organization).toBe(assignment.department.organization);
        expect(assignment.assignedAt).toBeInstanceOf(Date);
    });

    it("should revoke and restore assignment", () => {
        const assignment = createAssignment();

        assignment.revoke();
        expect(assignment.status).toBe(AssignmentStatus.REVOKED);
        expect(() => assignment.canPurge()).not.toThrow();

        assignment.restore();
        expect(assignment.status).toBe(AssignmentStatus.ACTIVE);
    });

    it("should reject duplicate transitions and purging an active assignment", () => {
        const assignment = createAssignment();

        expect(() => assignment.restore()).toThrow("ALREADY_ACTIVE");
        expect(() => assignment.canPurge()).toThrow("CANNOT_PURGE_ACTIVE");
        assignment.revoke();
        expect(() => assignment.revoke()).toThrow("ALREADY_REVOKED");
    });
});
