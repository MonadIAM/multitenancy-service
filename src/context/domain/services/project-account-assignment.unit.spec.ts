import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { ProjectAccountAssignmentUnitHelpers } from "~testing/unit/domain-service/project-account-assignment.helpers";
import { AssignmentStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID      = "00000000-0000-4000-8000-100000000001";
const MEMBERSHIP_ID = "00000000-0000-4000-8000-100000000002";
const PROJECT_ID    = "00000000-0000-4000-8000-100000000003";
const ASSIGNMENT_ID = "00000000-0000-4000-8000-100000000004";
const ACTOR_ID      = "00000000-0000-4000-8000-100000000005";
/* eslint-enable prettier/prettier */

const helpers = new ProjectAccountAssignmentUnitHelpers();

describe("ProjectAccountAssignmentService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates an assignment for an active membership and project in the same organization", async () => {
        const organization = helpers.createOrganization({ realm: REALM_ID });
        const membership = helpers.createOrgMembership({
            id: MEMBERSHIP_ID,
            organization,
        });
        const project = helpers.createProject({
            id: PROJECT_ID,
            organization,
            realm: REALM_ID,
        });
        const { service, transaction } = helpers.service({
            memberships: [membership],
            projects: [project],
        });

        const result = await service.create({
            input: { membership: MEMBERSHIP_ID, project: PROJECT_ID },
            transaction: transaction.entityManager,
            actor: ACTOR_ID,
            realm: REALM_ID,
        });

        expect(result).toEqual(
            expect.objectContaining({
                membership,
                project,
                assignedBy: ACTOR_ID,
            }),
        );
        expect(transaction.persist).toHaveBeenCalledWith(result);
    });

    it("rejects assignments across organizations", async () => {
        const membership = helpers.createOrgMembership({ id: MEMBERSHIP_ID });
        const project = helpers.createProject({
            id: PROJECT_ID,
            organization: helpers.createOrganization(),
        });
        const { service, transaction } = helpers.service({
            memberships: [membership],
            projects: [project],
        });

        await expect(
            service.create({
                input: { membership: MEMBERSHIP_ID, project: PROJECT_ID },
                transaction: transaction.entityManager,
                actor: ACTOR_ID,
                realm: REALM_ID,
            }),
        ).rejects.toThrow("services.project-account-assignment.ORGANIZATION_MISMATCH");
        expect(transaction.persist).not.toHaveBeenCalled();
    });

    it("deduplicates bulk identifiers and rejects incomplete results", async () => {
        const assignment = helpers.createProjectAccountAssignment({
            id: ASSIGNMENT_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            projectAssignments: [assignment],
        });

        await expect(
            service.revoke({
                identifiers: [ASSIGNMENT_ID, ASSIGNMENT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).resolves.toEqual([assignment]);

        expect(repositories.projectAssignments.find).toHaveBeenCalledWith({
            where: {
                id: { $in: [ASSIGNMENT_ID] },
                organization: { realm: REALM_ID },
            },
            transaction: transaction.entityManager,
        });

        repositories.projectAssignments.find.mockImplementation(() => Promise.resolve([]));

        await expect(
            service.restore({
                identifiers: [ASSIGNMENT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).rejects.toThrow("services.project-account-assignment.ASSIGNMENTS_NOT_FOUND");
    });

    it("purges revoked assignments and clean removes all assignments for memberships", async () => {
        const assignment = helpers.createProjectAccountAssignment({
            id: ASSIGNMENT_ID,
            status: AssignmentStatus.REVOKED,
        });
        const { service, repositories, transaction } = helpers.service({
            projectAssignments: [assignment],
        });

        await service.purge({
            identifiers: [ASSIGNMENT_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(transaction.remove).toHaveBeenCalledWith(assignment);

        transaction.remove.mockClear();

        await expect(
            service.clean({
                memberships: [MEMBERSHIP_ID],
                transaction: transaction.entityManager,
            }),
        ).resolves.toEqual([assignment]);

        expect(repositories.projectAssignments.find).toHaveBeenLastCalledWith({
            where: { membership: { id: { $in: [MEMBERSHIP_ID] } } },
            transaction: transaction.entityManager,
        });
        expect(transaction.remove).toHaveBeenCalledWith(assignment);
    });
});
