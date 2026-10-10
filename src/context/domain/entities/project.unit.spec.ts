import { describe, expect, it } from "@jest/globals";

import { ProjectStatus } from "~context/enums";

import { ProjectAccountAssignment } from "./project-account-assignment.entity";
import { Organization } from "./organization.entity";
import { Membership } from "./membership.entity";
import { Project } from "./project.entity";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const ACTOR_ID   = "00000000-0000-4000-8000-000000000002";
const REALM_ID   = "00000000-0000-4000-8000-000000000003";
/* eslint-enable prettier/prettier */

function createProject(): Project {
    const organization = new Organization({
        description: "Description",
        title: "Organization",
        realm: REALM_ID,
    });
    return new Project({
        description: "Description",
        name: "Project",
        organization,
        realm: REALM_ID,
    });
}

function createAssignment(project: Project): ProjectAccountAssignment {
    const membership = new Membership({
        organization: project.organization,
        account: ACCOUNT_ID,
    });
    return new ProjectAccountAssignment({
        assignedBy: ACTOR_ID,
        membership,
        project,
    });
}

describe("Project Entity", () => {
    describe("constructor", () => {
        it("should initialize an active project without a manager", () => {
            const project = createProject();

            expect(project.status).toBe(ProjectStatus.ACTIVE);
            expect(project.manager).toBeUndefined();
        });
    });

    describe("assignManager / unassignManager", () => {
        it("should assign, replace and unassign a manager", () => {
            const project = createProject();
            const first = createAssignment(project);
            const second = createAssignment(project);

            project.assignManager({ assignment: first });
            project.assignManager({ assignment: second });
            expect(project.manager).toBe(second);

            project.unassignManager();
            expect(project.manager).toBeUndefined();
        });

        it("should reject manager operations without changes", () => {
            const project = createProject();
            const assignment = createAssignment(project);
            project.assignManager({ assignment });

            expect(() => project.assignManager({ assignment })).toThrow("NO_CHANGES_DETECTED");
            project.unassignManager();
            expect(() => project.unassignManager()).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("update", () => {
        it("should update mutable metadata", () => {
            const project = createProject();

            project.update({
                patch: { description: "Updated", name: "Updated project" },
            });

            expect(project.description).toBe("Updated");
            expect(project.name).toBe("Updated project");
            expect(project.updatedAt).toBeInstanceOf(Date);
        });

        it("should reject empty and unchanged metadata updates", () => {
            const project = createProject();

            expect(() => project.update({ patch: {} })).toThrow("EMPTY_UPDATE_PATCH");
            expect(() => project.update({ patch: { name: project.name } })).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("archive / restore / canPurge", () => {
        it("should archive, restore and guard purging", () => {
            const project = createProject();
            expect(() => project.canPurge()).toThrow("CANNOT_PURGE_ACTIVE");

            project.archive();
            expect(project.status).toBe(ProjectStatus.ARCHIVED);
            expect(project.archivedAt).toBeInstanceOf(Date);
            expect(() => project.canPurge()).not.toThrow();

            project.restore();
            expect(project.status).toBe(ProjectStatus.ACTIVE);
            expect(project.archivedAt).toBeUndefined();
        });
    });

    describe("beginBootstrap", () => {
        it("rejects a competing bootstrap without replacing the current process", () => {
            const project = createProject();
            project.beginBootstrap();
            const process = project.process;

            expect(() => project.beginBootstrap()).toThrow("entities.project.OPERATION_CONFLICT");

            expect(project.process).toBe(process);
            expect(project.status).toBe(ProjectStatus.PROVISIONING);
        });
    });

    describe("rejectBootstrap", () => {
        it("rejects a late bootstrap refusal after activation", () => {
            const project = createProject();
            project.beginBootstrap();
            project.confirmBootstrap();

            expect(() => project.rejectBootstrap("late rejection")).toThrow("entities.project.OPERATION_CONFLICT");

            expect(project.status).toBe(ProjectStatus.ACTIVE);
        });
    });
});
