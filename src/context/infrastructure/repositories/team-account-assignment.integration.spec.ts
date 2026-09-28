import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { TeamAccountAssignmentFixture } from "~testing/integration/repositories/team-account-assignment.fixture";
import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { AssignmentStatus } from "~context/enums";

import { TeamAccountAssignmentRepository } from "./team-account-assignment.repository";

describe("TeamAccountAssignmentRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new TeamAccountAssignmentRepository(readManager),
        fixture: (entityManager) => new TeamAccountAssignmentFixture(entityManager),
    });

    describe("findUniqueOrThrow", () => {
        it("maps the persisted team assignment through the schema", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createOrgMembership({ organization });
            const department = await suite.fixtures().createDepartment({ organization });
            const team = await suite.fixtures().createTeam({ department });
            const assignment = await suite.fixtures().createTeamAccountAssignment({ membership, team });

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
            expect(loaded.team.id).toBe(team.id);
        });
    });

    describe("findMany", () => {
        it("finds team assignments by account, team and status mapper filters", async () => {
            const { membership, matched, team } = await suite.fixtures().filterScenario();

            const [assignments, total] = await suite.repository().findMany({
                pagination: { currentPage: 1, elementsPerPage: 10 },
                sort: { assignedAt: QueryOrder.ASC },
                filters: {
                    account: { operator: PublicLinkOperator.EQUAL, value: membership.account },
                    team: { operator: PublicLinkOperator.EQUAL, value: team.id },
                    status: { operator: PublicStringOperator.EQUAL, value: AssignmentStatus.ACTIVE },
                },
            });

            expect(total).toBe(1);
            expect(assignments.map(({ id }) => id)).toEqual([matched.id]);
        });
    });
});
