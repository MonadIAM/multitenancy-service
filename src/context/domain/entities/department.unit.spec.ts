import { describe, expect, it } from "@jest/globals";

import { DepartmentStatus } from "~context/enums";

import { DeptAccountAssignment } from "./dept-account-assignment.entity";
import { OrgMembership } from "./org-membership.entity";
import { Organization } from "./organization.entity";
import { Department } from "./department.entity";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const ACTOR_ID   = "00000000-0000-4000-8000-000000000002";
const REALM_ID   = "00000000-0000-4000-8000-000000000003";
/* eslint-enable prettier/prettier */

function createDepartment(): Department {
    const organization = new Organization({
        description: "Description",
        realm: REALM_ID,
        title: "Organization",
    });
    return new Department({
        description: "Description",
        name: "Department",
        organization,
    });
}

function createAssignment(department: Department): DeptAccountAssignment {
    const membership = new OrgMembership({
        account: ACCOUNT_ID,
        organization: department.organization,
    });
    return new DeptAccountAssignment({
        assignedBy: ACTOR_ID,
        department,
        membership,
    });
}

describe("Department Entity", () => {
    describe("constructor", () => {
        it("should initialize an active department without a manager", () => {
            const department = createDepartment();

            expect(department.status).toBe(DepartmentStatus.ACTIVE);
            expect(department.manager).toBeUndefined();
        });
    });

    describe("assignManager / unassignManager", () => {
        it("should assign, replace and unassign a manager", () => {
            const department = createDepartment();
            const first = createAssignment(department);
            const second = createAssignment(department);

            department.assignManager({ assignment: first });
            department.assignManager({ assignment: second });
            expect(department.manager).toBe(second);

            department.unassignManager();
            expect(department.manager).toBeUndefined();
        });

        it("should reject manager operations without changes", () => {
            const department = createDepartment();
            const assignment = createAssignment(department);
            department.assignManager({ assignment });

            expect(() => department.assignManager({ assignment })).toThrow("NO_CHANGES_DETECTED");
            department.unassignManager();
            expect(() => department.unassignManager()).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("update", () => {
        it("should update mutable metadata", () => {
            const department = createDepartment();

            department.update({
                patch: { description: "Updated", name: "Updated department" },
            });

            expect(department.description).toBe("Updated");
            expect(department.name).toBe("Updated department");
        });

        it("should reject empty and unchanged metadata updates", () => {
            const department = createDepartment();

            expect(() => department.update({ patch: {} })).toThrow("EMPTY_UPDATE_PATCH");
            expect(() => department.update({ patch: { name: department.name } })).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("archive / restore / canPurge", () => {
        it("should archive, restore and guard purging", () => {
            const department = createDepartment();
            expect(() => department.canPurge()).toThrow("CANNOT_PURGE_ACTIVE");

            department.archive();
            expect(() => department.canPurge()).not.toThrow();
            department.restore();

            expect(department.status).toBe(DepartmentStatus.ACTIVE);
            expect(department.archivedAt).toBeUndefined();
        });
    });
});
