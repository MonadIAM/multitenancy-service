import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { LockMode } from "@mikro-orm/core";

import { DepartmentUnitHelpers } from "~testing/unit/domain-service/department.helpers";
import { DepartmentStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID        = "00000000-0000-4000-8000-100000000001";
const ORGANIZATION_ID = "00000000-0000-4000-8000-100000000002";
const DEPARTMENT_ID   = "00000000-0000-4000-8000-100000000003";
const POSITION_ID     = "00000000-0000-4000-8000-100000000004";
/* eslint-enable prettier/prettier */

const helpers = new DepartmentUnitHelpers();

describe("DepartmentService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("create", () => {
        it("creates a department in the requested organization", async () => {
            const organization = helpers.createOrganization({
                id: ORGANIZATION_ID,
            });
            const { service, repositories, transaction } = helpers.service({
                organizations: [organization],
            });

            const result = await service.create({
                input: {
                    name: "Department",
                    description: "Description",
                },
                transaction: transaction.entityManager,
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
            });

            expect(repositories.organizations.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: ORGANIZATION_ID, realm: REALM_ID },
                options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                transaction: transaction.entityManager,
            });
            expect(result.organization).toBe(organization);
            expect(transaction.persist).toHaveBeenCalledWith(result);
        });
    });

    describe("changeManager", () => {
        it("assigns an HR position as managerPosition", async () => {
            const department = helpers.createDepartment({ id: DEPARTMENT_ID });
            const { service, transaction } = helpers.service({
                departments: [department],
            });

            await service.changeManager({
                id: DEPARTMENT_ID,
                position: POSITION_ID,
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(department.managerPosition).toBe(POSITION_ID);
        });
    });

    describe("update / changeManager", () => {
        it("updates department metadata", async () => {
            const department = helpers.createDepartment({ id: DEPARTMENT_ID });
            department.assignManager({ position: POSITION_ID });
            const { service, transaction } = helpers.service({ departments: [department] });

            await service.update({
                id: DEPARTMENT_ID,
                patch: { name: "Updated" },
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(department.name).toBe("Updated");
        });

        it("unassigns the department managerPosition", async () => {
            const department = helpers.createDepartment({ id: DEPARTMENT_ID });
            department.assignManager({ position: POSITION_ID });
            const { service, transaction } = helpers.service({ departments: [department] });

            await service.changeManager({
                position: null,
                id: DEPARTMENT_ID,
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(department.managerPosition).toBeUndefined();
        });
    });

    describe("archive", () => {
        it("deduplicates archive identifiers and scopes them by organization", async () => {
            const department = helpers.createDepartment({ id: DEPARTMENT_ID });
            const { service, repositories, transaction } = helpers.service({
                departments: [department],
            });

            await service.archive({
                identifiers: [DEPARTMENT_ID, DEPARTMENT_ID],
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(repositories.departments.find).toHaveBeenCalledWith({
                where: {
                    id: { $in: [DEPARTMENT_ID] },
                    organization: { id: ORGANIZATION_ID, realm: REALM_ID },
                },
                transaction: transaction.entityManager,
            });
        });
    });

    describe("purge", () => {
        it.each(["active", "pending"] as const)("does not delete a department that is %s", async (state) => {
            const department = helpers.createDepartment({
                id: DEPARTMENT_ID,
                status: state === "active" ? DepartmentStatus.ACTIVE : DepartmentStatus.ARCHIVED,
            });
            if (state === "pending") {
                department.process = "pending-position-operation";
            }
            const { service, transaction } = helpers.service({ departments: [department] });

            const result = service.purge({
                id: DEPARTMENT_ID,
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            await expect(result).rejects.toThrow(state === "active" ? "CANNOT_PURGE_ACTIVE" : "OPERATION_CONFLICT");

            expect(transaction.remove).not.toHaveBeenCalled();
            expect(transaction.flush).not.toHaveBeenCalled();
        });
    });

    describe("purge / restore", () => {
        it("purges one archived department without repeated reads or flush", async () => {
            const department = helpers.createDepartment({
                id: DEPARTMENT_ID,
                status: DepartmentStatus.ARCHIVED,
            });
            const { service, repositories, transaction } = helpers.service({
                departments: [department],
            });

            const result = await service.purge({
                id: DEPARTMENT_ID,
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(result).toBe(department);
            expect(repositories.departments.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(repositories.departments.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: DEPARTMENT_ID, organization: ORGANIZATION_ID },
                transaction: transaction.entityManager,
            });
            expect(repositories.departments.find).not.toHaveBeenCalled();
            expect(transaction.remove).toHaveBeenCalledWith(department);
            expect(transaction.flush).not.toHaveBeenCalled();
        });

        it("rejects incomplete restore results", async () => {
            const { service, repositories, transaction } = helpers.service();
            repositories.departments.find.mockImplementation(() => Promise.resolve([]));

            const result = service.restore({
                identifiers: [DEPARTMENT_ID],
                organization: ORGANIZATION_ID,
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            await expect(result).rejects.toThrow("services.department.DEPARTMENTS_NOT_FOUND");
        });
    });
});
