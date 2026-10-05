import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { DepartmentStatus } from "~context/enums";

import { Organization } from "./organization.entity";
import { Department } from "./department.entity";

const REALM_ID = "00000000-0000-4000-8000-000000000003";

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

describe("Department Entity", () => {
    describe("constructor", () => {
        it("should initialize an active department without a managerPosition", () => {
            const department = createDepartment();

            expect(department.status).toBe(DepartmentStatus.ACTIVE);
            expect(department.managerPosition).toBeUndefined();
        });
    });

    describe("assignManager / unassignManager", () => {
        it("should assign, replace and unassign a managerPosition", () => {
            const department = createDepartment();
            const first = randomUUID();
            const second = randomUUID();

            department.assignManager({ position: first });
            department.completePosition(false);
            department.assignManager({ position: second });
            expect(department.managerPosition).toBe(second);

            department.unassignManager();
            expect(department.managerPosition).toBeUndefined();
        });

        it("should reject managerPosition operations without changes", () => {
            const department = createDepartment();
            const position = randomUUID();
            department.assignManager({ position });
            department.completePosition(false);

            expect(() => department.assignManager({ position })).toThrow("NO_CHANGES_DETECTED");
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
