import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { TeamUnitHelpers } from "~testing/unit/domain-service/team.helpers";
import { TeamStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID      = "00000000-0000-4000-8000-100000000001";
const DEPARTMENT_ID = "00000000-0000-4000-8000-100000000002";
const TEAM_ID       = "00000000-0000-4000-8000-100000000003";
const ASSIGNMENT_ID = "00000000-0000-4000-8000-100000000004";
/* eslint-enable prettier/prettier */

const helpers = new TeamUnitHelpers();

describe("TeamService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates a team in an active department and derives its organization", async () => {
        const department = helpers.createDepartment({ id: DEPARTMENT_ID });
        const { service, repositories, transaction } = helpers.service({
            departments: [department],
        });

        const result = await service.create({
            input: {
                department: DEPARTMENT_ID,
                name: "Team",
                description: "Description",
            },
            transaction: transaction.entityManager,
            realm: REALM_ID,
        });

        expect(repositories.departments.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
                id: DEPARTMENT_ID,
                organization: { realm: REALM_ID },
                status: "ACTIVE",
            },
            options: { populate: ["organization"] },
            transaction: transaction.entityManager,
        });
        expect(result.organization).toBe(department.organization);
        expect(transaction.persist).toHaveBeenCalledWith(result);
    });

    it("assigns an active team assignment as lead", async () => {
        const team = helpers.createTeam({ id: TEAM_ID });
        const assignment = helpers.createTeamAccountAssignment({
            id: ASSIGNMENT_ID,
            team,
        });
        const { service, repositories, transaction } = helpers.service({
            teams: [team],
        });
        repositories.teamAssignments.findUniqueOrThrow.mockImplementation(() => Promise.resolve(assignment));

        await service.changeLead({
            id: TEAM_ID,
            assignment: ASSIGNMENT_ID,
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(team.lead).toBe(assignment);
    });

    it("updates team metadata and unassigns its lead", async () => {
        const team = helpers.createTeam({ id: TEAM_ID });
        team.assignLead({ assignment: helpers.createTeamAccountAssignment({ team }) });
        const { service, repositories, transaction } = helpers.service({ teams: [team] });

        await service.update({
            id: TEAM_ID,
            patch: { name: "Updated" },
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });
        await service.changeLead({
            assignment: null,
            id: TEAM_ID,
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(team.name).toBe("Updated");
        expect(team.lead).toBeUndefined();
        expect(repositories.teamAssignments.findUniqueOrThrow).not.toHaveBeenCalled();
    });

    it("deduplicates archive identifiers and rejects incomplete results", async () => {
        const team = helpers.createTeam({ id: TEAM_ID });
        const { service, repositories, transaction } = helpers.service({
            teams: [team],
        });

        await service.archive({
            identifiers: [TEAM_ID, TEAM_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(repositories.teams.find).toHaveBeenCalledWith({
            where: {
                id: { $in: [TEAM_ID] },
                organization: { realm: REALM_ID },
            },
            transaction: transaction.entityManager,
        });

        repositories.teams.find.mockImplementation(() => Promise.resolve([]));

        await expect(
            service.restore({
                identifiers: [TEAM_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).rejects.toThrow("services.team.TEAMS_NOT_FOUND");
    });

    it("purges archived teams", async () => {
        const team = helpers.createTeam({
            id: TEAM_ID,
            status: TeamStatus.ARCHIVED,
        });
        const { service, transaction } = helpers.service({ teams: [team] });

        await service.purge({
            identifiers: [TEAM_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(transaction.remove).toHaveBeenCalledWith(team);
    });
});
