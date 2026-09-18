import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { DepartmentUnitHelpers } from "~testing/unit/domain-service/department.helpers";
import { DepartmentStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID        = "00000000-0000-4000-8000-100000000001";
const ORGANIZATION_ID = "00000000-0000-4000-8000-100000000002";
const DEPARTMENT_ID   = "00000000-0000-4000-8000-100000000003";
const ASSIGNMENT_ID   = "00000000-0000-4000-8000-100000000004";
/* eslint-enable prettier/prettier */

const helpers = new DepartmentUnitHelpers();

describe("DepartmentService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates a department in an active realm organization", async () => {
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
                name: "Department",
                description: "Description",
            },
            transaction: transaction.entityManager,
            realm: REALM_ID,
        });

        expect(repositories.organizations.findUniqueOrThrow).toHaveBeenCalledWith({
            where: { status: "ACTIVE", id: ORGANIZATION_ID, realm: REALM_ID },
            transaction: transaction.entityManager,
        });
        expect(result.organization).toBe(organization);
        expect(transaction.persist).toHaveBeenCalledWith(result);
    });

    it("assigns an active department assignment as manager", async () => {
        const department = helpers.createDepartment({ id: DEPARTMENT_ID });
        const assignment = helpers.createDeptAccountAssignment({
            id: ASSIGNMENT_ID,
            department,
        });
        const { service, repositories, transaction } = helpers.service({
            departments: [department],
        });
        repositories.departmentAssignments.findUniqueOrThrow.mockImplementation(() => Promise.resolve(assignment));

        await service.assignManager({
            id: DEPARTMENT_ID,
            assignment: ASSIGNMENT_ID,
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(department.manager).toBe(assignment);
    });

    it("updates department metadata and unassigns its manager", async () => {
        const department = helpers.createDepartment({ id: DEPARTMENT_ID });
        department.assignManager({ assignment: helpers.createDeptAccountAssignment({ department }) });
        const { service, transaction } = helpers.service({ departments: [department] });

        await service.update({
            id: DEPARTMENT_ID,
            patch: { name: "Updated" },
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });
        await service.unassignManager({ id: DEPARTMENT_ID, realm: REALM_ID, transaction: transaction.entityManager });

        expect(department.name).toBe("Updated");
        expect(department.manager).toBeUndefined();
    });

    it("deduplicates archive identifiers and scopes them by organization realm", async () => {
        const department = helpers.createDepartment({ id: DEPARTMENT_ID });
        const { service, repositories, transaction } = helpers.service({
            departments: [department],
        });

        await service.archive({
            identifiers: [DEPARTMENT_ID, DEPARTMENT_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(repositories.departments.find).toHaveBeenCalledWith({
            where: {
                id: { $in: [DEPARTMENT_ID] },
                organization: { realm: REALM_ID },
            },
            transaction: transaction.entityManager,
        });
    });

    it("rejects incomplete restore results and purges archived departments", async () => {
        const department = helpers.createDepartment({
            id: DEPARTMENT_ID,
            status: DepartmentStatus.ARCHIVED,
        });
        const { service, repositories, transaction } = helpers.service({
            departments: [department],
        });

        await service.purge({
            identifiers: [DEPARTMENT_ID],
            realm: REALM_ID,
            transaction: transaction.entityManager,
        });

        expect(transaction.remove).toHaveBeenCalledWith(department);

        repositories.departments.find.mockImplementation(() => Promise.resolve([]));

        await expect(
            service.restore({
                identifiers: [DEPARTMENT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            }),
        ).rejects.toThrow("services.department.DEPARTMENTS_NOT_FOUND");
    });
});
