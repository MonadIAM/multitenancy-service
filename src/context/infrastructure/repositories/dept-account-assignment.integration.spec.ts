import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { DeptAccountAssignmentFixture } from "~testing/integration/repositories/dept-account-assignment.fixture";
import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { AssignmentStatus } from "~context/enums";

import { DeptAccountAssignmentRepository } from "./dept-account-assignment.repository";

describe("DeptAccountAssignmentRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new DeptAccountAssignmentRepository(readManager),
        fixture: (entityManager) => new DeptAccountAssignmentFixture(entityManager),
    });

    it("maps the persisted department assignment through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const membership = await suite.fixtures().createOrgMembership({ organization });
        const department = await suite.fixtures().createDepartment({ organization });
        const assignment = await suite.fixtures().createDeptAccountAssignment({ membership, department });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: assignment.id } });

        expect(loaded).toMatchObject({
            status: AssignmentStatus.ACTIVE,
            assignedAt: assignment.assignedAt,
            assignedBy: assignment.assignedBy,
            version: assignment.version,
            id: assignment.id,
        });
        expect(loaded.organization.id).toBe(organization.id);
        expect(loaded.membership.id).toBe(membership.id);
        expect(loaded.department.id).toBe(department.id);
    });

    it("finds department assignments by account, department and status mapper filters", async () => {
        const { membership, department, matched } = await suite.fixtures().filterScenario();

        const [assignments, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { assignedAt: QueryOrder.ASC },
            filters: {
                account: { operator: PublicLinkOperator.EQUAL, value: membership.account },
                department: { operator: PublicLinkOperator.EQUAL, value: department.id },
                status: { operator: PublicStringOperator.EQUAL, value: AssignmentStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(assignments.map(({ id }) => id)).toEqual([matched.id]);
    });
});
