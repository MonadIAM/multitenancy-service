import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { TeamStatus } from "~context/enums";

import { Organization } from "./organization.entity";
import { Department } from "./department.entity";
import { Team } from "./team.entity";

const REALM_ID = "00000000-0000-4000-8000-000000000003";

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

describe("Team Entity", () => {
    describe("constructor", () => {
        it("should initialize an active team without a leadPosition", () => {
            const team = createTeam();

            expect(team.status).toBe(TeamStatus.ACTIVE);
            expect(team.leadPosition).toBeUndefined();
        });
    });

    describe("assignLead / unassignLead", () => {
        it("should assign, replace and unassign a leadPosition", () => {
            const team = createTeam();
            const first = randomUUID();
            const second = randomUUID();

            team.assignLead({ position: first });
            team.completePosition(false);
            team.assignLead({ position: second });
            expect(team.leadPosition).toBe(second);

            team.unassignLead();
            expect(team.leadPosition).toBeUndefined();
        });

        it("should reject leadPosition operations without changes", () => {
            const team = createTeam();
            const position = randomUUID();
            team.assignLead({ position });
            team.completePosition(false);

            expect(() => team.assignLead({ position })).toThrow("NO_CHANGES_DETECTED");
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
