import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { OrgMembershipIntegrationHelpers } from "~testing/integration/domain-service/org-membership.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import {
    ProjectAccountAssignment,
    DeptAccountAssignment,
    TeamAccountAssignment,
    OrgMembership,
} from "~context/domain/entities";

const helpers = new OrgMembershipIntegrationHelpers();

describe("OrgMembershipService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it.each(["leave", "block"] as const)(
        "%s changes membership status and cleans every assignment kind",
        async (operation) => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createOrgMembership({ organization });
            const project = await suite.fixtures().createProject({ organization, realm: organization.realm });
            const department = await suite.fixtures().createDepartment({ organization });
            const team = await suite.fixtures().createTeam({ department, organization });
            await suite.fixtures().createProjectAccountAssignment({ membership, project });
            await suite.fixtures().createDeptAccountAssignment({ membership, department });
            await suite.fixtures().createTeamAccountAssignment({ membership, team });

            await suite.transaction((transaction) =>
                suite.repository().membershipService[operation]({
                    account: membership.account,
                    identifiers: [membership.id],
                    realm: organization.realm,
                    transaction,
                }),
            );

            const [loaded, projectCount, departmentCount, teamCount] = await suite.transaction(
                async (transaction) =>
                    await Promise.all([
                        transaction.findOneOrFail(OrgMembership, { id: membership.id }),
                        transaction.count(ProjectAccountAssignment, { membership: { id: membership.id } }),
                        transaction.count(DeptAccountAssignment, { membership: { id: membership.id } }),
                        transaction.count(TeamAccountAssignment, { membership: { id: membership.id } }),
                    ]),
            );
            expect(loaded.status).toBe(operation === "leave" ? "LEFT" : "BLOCKED");
            expect([projectCount, departmentCount, teamCount]).toEqual([0, 0, 0]);
        },
    );

    it("joins a new account into an active organization", async () => {
        const organization = await suite.fixtures().createOrganization();
        const account = randomUUID();

        const membership = await suite.transaction((transaction) =>
            suite.repository().membershipService.join({
                input: { organization: organization.id, account },
                realm: organization.realm,
                transaction,
            }),
        );

        await expect(
            suite.transaction((transaction) => transaction.count(OrgMembership, { id: membership.id, account })),
        ).resolves.toBe(1);
    });
});
