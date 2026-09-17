import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { ProjectAccountAssignmentFixture } from "~testing/integration/repositories/project-account-assignment.fixture";
import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { AssignmentStatus } from "~context/enums";

import { ProjectAccountAssignmentRepository } from "./project-account-assignment.repository";

describe("ProjectAccountAssignmentRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new ProjectAccountAssignmentRepository(readManager),
        fixture: (entityManager) => new ProjectAccountAssignmentFixture(entityManager),
    });

    it("maps the persisted project assignment through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const membership = await suite.fixtures().createOrgMembership({ organization });
        const project = await suite.fixtures().createProject({ organization });
        const assignment = await suite.fixtures().createProjectAccountAssignment({ membership, project });

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
        expect(loaded.project.id).toBe(project.id);
    });

    it("finds project assignments by account, project and status mapper filters", async () => {
        const { membership, project, matched } = await suite.fixtures().filterScenario();

        const [assignments, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { assignedAt: QueryOrder.ASC },
            filters: {
                account: { operator: PublicLinkOperator.EQUAL, value: membership.account },
                project: { operator: PublicLinkOperator.EQUAL, value: project.id },
                status: { operator: PublicStringOperator.EQUAL, value: AssignmentStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(assignments.map(({ id }) => id)).toEqual([matched.id]);
    });
});
