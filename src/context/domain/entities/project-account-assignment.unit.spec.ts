import { describe, expect, it } from "@jest/globals";
import { isUUID } from "class-validator";

import { AssignmentStatus } from "~context/enums";

import { ProjectAccountAssignment } from "./project-account-assignment.entity";
import { Organization } from "./organization.entity";
import { Membership } from "./membership.entity";
import { Project } from "./project.entity";

const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const ACTOR_ID = "00000000-0000-4000-8000-000000000002";
const REALM_ID = "00000000-0000-4000-8000-000000000003";

function createAssignment(): ProjectAccountAssignment {
    const organization = new Organization({
        description: "Description",
        realm: REALM_ID,
        title: "Organization",
    });
    const membership = new Membership({ account: ACCOUNT_ID, organization });
    const project = new Project({
        description: "Description",
        name: "Project",
        organization,
        realm: REALM_ID,
    });
    return new ProjectAccountAssignment({
        assignedBy: ACTOR_ID,
        membership,
        project,
    });
}

describe("ProjectAccountAssignment Entity", () => {
    describe("constructor", () => {
        it("should initialize an active immutable assignment", () => {
            const assignment = createAssignment();

            expect(isUUID(assignment.id, "4")).toBe(true);
            expect(assignment.status).toBe(AssignmentStatus.ACTIVE);
            expect(assignment.organization).toBe(assignment.project.organization);
            expect(assignment.assignedAt).toBeInstanceOf(Date);
        });
    });

    describe("revoke / restore / canPurge", () => {
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
});
