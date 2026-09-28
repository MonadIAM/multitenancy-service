import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { DeptAccountAssignmentUnitHelpers } from "~testing/unit/domain-service/dept-account-assignment.helpers";
import { AssignmentStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID      = "00000000-0000-4000-8000-100000000001";
const MEMBERSHIP_ID = "00000000-0000-4000-8000-100000000002";
const DEPARTMENT_ID = "00000000-0000-4000-8000-100000000003";
const ASSIGNMENT_ID = "00000000-0000-4000-8000-100000000004";
const ACTOR_ID      = "00000000-0000-4000-8000-100000000005";
/* eslint-enable prettier/prettier */

const helpers = new DeptAccountAssignmentUnitHelpers();

describe("DeptAccountAssignmentService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("create", () => {
        it("creates an assignment in the same organization", async () => {
            const organization = helpers.createOrganization({ realm: REALM_ID });
            const membership = helpers.createOrgMembership({
                id: MEMBERSHIP_ID,
                organization,
            });
            const department = helpers.createDepartment({
                id: DEPARTMENT_ID,
                organization,
            });
            const { service, transaction } = helpers.service({
                memberships: [membership],
                departments: [department],
            });

            const result = await service.create({
                input: { membership: MEMBERSHIP_ID, department: DEPARTMENT_ID },
                transaction: transaction.entityManager,
                actor: ACTOR_ID,
                realm: REALM_ID,
            });

            expect(result).toEqual(
                expect.objectContaining({
                    membership,
                    department,
                    assignedBy: ACTOR_ID,
                }),
            );
            expect(transaction.persist).toHaveBeenCalledWith(result);
        });

        it("rejects assignments across organizations", async () => {
            const membership = helpers.createOrgMembership({ id: MEMBERSHIP_ID });
            const department = helpers.createDepartment({
                id: DEPARTMENT_ID,
                organization: helpers.createOrganization(),
            });
            const { service, transaction } = helpers.service({
                memberships: [membership],
                departments: [department],
            });

            await expect(
                service.create({
                    input: { membership: MEMBERSHIP_ID, department: DEPARTMENT_ID },
                    transaction: transaction.entityManager,
                    actor: ACTOR_ID,
                    realm: REALM_ID,
                }),
            ).rejects.toThrow("services.dept-account-assignment.ORGANIZATION_MISMATCH");
        });
    });

    describe("revoke / restore", () => {
        it("deduplicates revoke identifiers and rejects missing assignments", async () => {
            const assignment = helpers.createDeptAccountAssignment({
                id: ASSIGNMENT_ID,
            });
            const { service, repositories, transaction } = helpers.service({
                departmentAssignments: [assignment],
            });

            await service.revoke({
                identifiers: [ASSIGNMENT_ID, ASSIGNMENT_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(repositories.departmentAssignments.find).toHaveBeenCalledWith({
                where: {
                    id: { $in: [ASSIGNMENT_ID] },
                    organization: { realm: REALM_ID },
                },
                transaction: transaction.entityManager,
            });

            repositories.departmentAssignments.find.mockImplementation(() => Promise.resolve([]));

            await expect(
                service.restore({
                    identifiers: [ASSIGNMENT_ID],
                    realm: REALM_ID,
                    transaction: transaction.entityManager,
                }),
            ).rejects.toThrow("services.dept-account-assignment.ASSIGNMENTS_NOT_FOUND");
        });
    });

    describe("purge / clean", () => {
        it("purges revoked assignments and cleans memberships", async () => {
            const assignment = helpers.createDeptAccountAssignment({
                id: ASSIGNMENT_ID,
                status: AssignmentStatus.REVOKED,
            });
            const { service, repositories, transaction } = helpers.service({
                departmentAssignments: [assignment],
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

            expect(repositories.departmentAssignments.find).toHaveBeenLastCalledWith({
                where: { membership: { id: { $in: [MEMBERSHIP_ID] } } },
                transaction: transaction.entityManager,
            });
            expect(transaction.remove).toHaveBeenCalledWith(assignment);
        });
    });
});
