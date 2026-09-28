import { describe, expect, it } from "@jest/globals";

import { TeamStatus } from "~context/enums";

import { TeamAccountAssignment } from "./team-account-assignment.entity";
import { OrgMembership } from "./org-membership.entity";
import { Organization } from "./organization.entity";
import { Department } from "./department.entity";
import { Team } from "./team.entity";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";
const ACTOR_ID   = "00000000-0000-4000-8000-000000000002";
const REALM_ID   = "00000000-0000-4000-8000-000000000003";
/* eslint-enable prettier/prettier */

function createTeam(): Team {
    const organization = new Organization({
        description: "Description",
        title: "Organization",
        realm: REALM_ID,
    });
    const department = new Department({
        description: "Description",
        name: "Department",
        organization,
    });
    return new Team({
        description: "Description",
        name: "Team",
        organization,
        department,
    });
}

function createAssignment(team: Team): TeamAccountAssignment {
    const membership = new OrgMembership({
        organization: team.organization,
        account: ACCOUNT_ID,
    });
    return new TeamAccountAssignment({
        assignedBy: ACTOR_ID,
        membership,
        team,
    });
}

describe("Team Entity", () => {
    describe("constructor", () => {
        it("should initialize an active team without a lead", () => {
            const team = createTeam();

            expect(team.status).toBe(TeamStatus.ACTIVE);
            expect(team.lead).toBeUndefined();
        });
    });

    describe("assignLead / unassignLead", () => {
        it("should assign, replace and unassign a lead", () => {
            const team = createTeam();
            const first = createAssignment(team);
            const second = createAssignment(team);

            team.assignLead({ assignment: first });
            team.assignLead({ assignment: second });
            expect(team.lead).toBe(second);

            team.unassignLead();
            expect(team.lead).toBeUndefined();
        });

        it("should reject lead operations without changes", () => {
            const team = createTeam();
            const assignment = createAssignment(team);
            team.assignLead({ assignment });

            expect(() => team.assignLead({ assignment })).toThrow("NO_CHANGES_DETECTED");
            team.unassignLead();
            expect(() => team.unassignLead()).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("update", () => {
        it("should update mutable metadata", () => {
            const team = createTeam();

            team.update({
                patch: { description: "Updated", name: "Updated team" },
            });

            expect(team.description).toBe("Updated");
            expect(team.name).toBe("Updated team");
        });

        it("should reject empty and unchanged metadata updates", () => {
            const team = createTeam();

            expect(() => team.update({ patch: {} })).toThrow("EMPTY_UPDATE_PATCH");
            expect(() => team.update({ patch: { name: team.name } })).toThrow("NO_CHANGES_DETECTED");
        });
    });

    describe("archive / restore / canPurge", () => {
        it("should archive, restore and guard purging", () => {
            const team = createTeam();
            expect(() => team.canPurge()).toThrow("CANNOT_PURGE_ACTIVE");

            team.archive();
            expect(() => team.canPurge()).not.toThrow();
            team.restore();

            expect(team.status).toBe(TeamStatus.ACTIVE);
            expect(team.archivedAt).toBeUndefined();
        });
    });
});
