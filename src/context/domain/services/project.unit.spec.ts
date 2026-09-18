import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { ProjectUnitHelpers } from "~testing/unit/domain-service/project.helpers";
import { ProjectStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID        = "00000000-0000-4000-8000-100000000001";
const ORGANIZATION_ID = "00000000-0000-4000-8000-100000000002";
const PROJECT_ID      = "00000000-0000-4000-8000-100000000003";
const ASSIGNMENT_ID   = "00000000-0000-4000-8000-100000000004";
/* eslint-enable prettier/prettier */

const helpers = new ProjectUnitHelpers();

describe("ProjectService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates a project only in an active organization from the same realm", async () => {
        const organization = helpers.createOrganization({
            id: ORGANIZATION_ID,
            realm: REALM_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            organizations: [organization],
        });

        const result = await service.create({
            input: {
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                name: "Project",
                description: "Description",
            },
            transaction: transaction.entityManager,
        });

        expect(repositories.organizations.findUniqueOrThrow).toHaveBeenCalledWith({
            where: { id: ORGANIZATION_ID, realm: REALM_ID, status: "ACTIVE" },
            transaction: transaction.entityManager,
        });
        expect(result.organization).toBe(organization);
        expect(transaction.persist).toHaveBeenCalledWith(result);
    });

    it("assigns an active project assignment as manager", async () => {
        const project = helpers.createProject({
            id: PROJECT_ID,
            realm: REALM_ID,
        });
        const assignment = helpers.createProjectAccountAssignment({
            id: ASSIGNMENT_ID,
            project,
        });
        const { service, repositories, transaction } = helpers.service({
            projects: [project],
        });
        repositories.projectAssignments.findUniqueOrThrow.mockImplementation(() => Promise.resolve(assignment));

        await expect(
            service.assignManager({
                id: PROJECT_ID,
                assignment: ASSIGNMENT_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).resolves.toBe(project);

        expect(project.manager).toBe(assignment);
    });

    it("updates project metadata and unassigns its manager", async () => {
        const project = helpers.createProject({ id: PROJECT_ID, realm: REALM_ID });
        project.assignManager({ assignment: helpers.createProjectAccountAssignment({ project }) });
        const { service, transaction } = helpers.service({ projects: [project] });

        await service.update({
            id: PROJECT_ID,
            patch: { name: "Updated" },
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });
        await service.unassignManager({ id: PROJECT_ID, realm: REALM_ID, transaction: transaction.entityManager });

        expect(project.name).toBe("Updated");
        expect(project.manager).toBeUndefined();
    });

    it("deduplicates archive identifiers and rejects incomplete results", async () => {
        const project = helpers.createProject({
            id: PROJECT_ID,
            realm: REALM_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            projects: [project],
        });

        await expect(
            service.archive({
                identifiers: [PROJECT_ID, PROJECT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).resolves.toEqual([project]);

        expect(repositories.projects.find).toHaveBeenCalledWith({
            where: { id: { $in: [PROJECT_ID] }, realm: REALM_ID },
            transaction: transaction.entityManager,
        });

        repositories.projects.find.mockImplementation(() => Promise.resolve([]));

        await expect(
            service.restore({
                identifiers: [PROJECT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).rejects.toThrow("services.project.PROJECTS_NOT_FOUND");
    });

    it("purges archived projects", async () => {
        const project = helpers.createProject({
            id: PROJECT_ID,
            realm: REALM_ID,
            status: ProjectStatus.ARCHIVED,
        });
        const { service, transaction } = helpers.service({
            projects: [project],
        });

        await service.purge({
            identifiers: [PROJECT_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(transaction.remove).toHaveBeenCalledWith(project);
    });
});
