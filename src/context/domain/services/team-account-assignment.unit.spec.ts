import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { TeamAccountAssignmentUnitHelpers } from "~testing/unit/domain-service/team-account-assignment.helpers";
import { AssignmentStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID      = "00000000-0000-4000-8000-100000000001";
const MEMBERSHIP_ID = "00000000-0000-4000-8000-100000000002";
const TEAM_ID       = "00000000-0000-4000-8000-100000000003";
const ASSIGNMENT_ID = "00000000-0000-4000-8000-100000000004";
const ACTOR_ID      = "00000000-0000-4000-8000-100000000005";
/* eslint-enable prettier/prettier */

const helpers = new TeamAccountAssignmentUnitHelpers();

describe("TeamAccountAssignmentService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates an assignment in the same organization", async () => {
        const organization = helpers.createOrganization({ realm: REALM_ID });
        const membership = helpers.createOrgMembership({
            id: MEMBERSHIP_ID,
            organization,
        });
        const department = helpers.createDepartment({ organization });
        const team = helpers.createTeam({
            id: TEAM_ID,
            organization,
            department,
        });
        const { service, transaction } = helpers.service({
            memberships: [membership],
            teams: [team],
        });

        const result = await service.create({
            input: { membership: MEMBERSHIP_ID, team: TEAM_ID },
            transaction: transaction.entityManager,
            actor: ACTOR_ID,
            realm: REALM_ID,
        });

        expect(result).toEqual(expect.objectContaining({ membership, team, assignedBy: ACTOR_ID }));
        expect(transaction.persist).toHaveBeenCalledWith(result);
    });

    it("rejects assignments across organizations", async () => {
        const membership = helpers.createOrgMembership({ id: MEMBERSHIP_ID });
        const team = helpers.createTeam({ id: TEAM_ID });
        const { service, transaction } = helpers.service({
            memberships: [membership],
            teams: [team],
        });

        await expect(
            service.create({
                input: { membership: MEMBERSHIP_ID, team: TEAM_ID },
                transaction: transaction.entityManager,
                actor: ACTOR_ID,
                realm: REALM_ID,
            }),
        ).rejects.toThrow("services.team-account-assignment.ORGANIZATION_MISMATCH");
    });

    it("deduplicates revoke identifiers and rejects missing assignments", async () => {
        const assignment = helpers.createTeamAccountAssignment({
            id: ASSIGNMENT_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            teamAssignments: [assignment],
        });

        await service.revoke({
            identifiers: [ASSIGNMENT_ID, ASSIGNMENT_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(repositories.teamAssignments.find).toHaveBeenCalledWith({
            where: {
                id: { $in: [ASSIGNMENT_ID] },
                organization: { realm: REALM_ID },
            },
            transaction: transaction.entityManager,
        });

        repositories.teamAssignments.find.mockImplementation(() => Promise.resolve([]));

        await expect(
            service.restore({
                identifiers: [ASSIGNMENT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).rejects.toThrow("services.team-account-assignment.ASSIGNMENTS_NOT_FOUND");
    });

    it("purges revoked assignments and cleans memberships", async () => {
        const assignment = helpers.createTeamAccountAssignment({
            id: ASSIGNMENT_ID,
            status: AssignmentStatus.REVOKED,
        });
        const { service, repositories, transaction } = helpers.service({
            teamAssignments: [assignment],
        });

        await service.purge({
            identifiers: [ASSIGNMENT_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        transaction.remove.mockClear();

        await service.clean({
            memberships: [MEMBERSHIP_ID],
            transaction: transaction.entityManager,
        });

        expect(repositories.teamAssignments.find).toHaveBeenLastCalledWith({
            where: { membership: { id: { $in: [MEMBERSHIP_ID] } } },
            transaction: transaction.entityManager,
        });
        expect(transaction.remove).toHaveBeenCalledWith(assignment);
    });
});
