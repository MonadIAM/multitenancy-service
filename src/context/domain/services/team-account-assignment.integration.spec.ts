import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { TeamAccountAssignmentIntegrationHelpers } from "~testing/integration/domain-service/team-account-assignment.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { TeamAccountAssignment } from "~context/domain/entities";

const helpers = new TeamAccountAssignmentIntegrationHelpers();

describe("TeamAccountAssignmentService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("creates and then cleans an assignment by membership", async () => {
        const organization = await suite.fixtures().createOrganization();
        const membership = await suite.fixtures().createOrgMembership({ organization });
        const department = await suite.fixtures().createDepartment({ organization });
        const team = await suite.fixtures().createTeam({ department, organization });

        const assignment = await suite.transaction((transaction) =>
            suite.repository().assignmentService.create({
                input: { membership: membership.id, team: team.id },
                actor: randomUUID(),
                realm: organization.realm,
                transaction,
            }),
        );
        await suite.transaction((transaction) =>
            suite.repository().assignmentService.clean({ memberships: [membership.id], transaction }),
        );

        await expect(
            suite.transaction((transaction) => transaction.count(TeamAccountAssignment, { id: assignment.id })),
        ).resolves.toBe(0);
    });
});
