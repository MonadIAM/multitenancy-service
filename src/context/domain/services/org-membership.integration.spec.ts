import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { OrgMembershipIntegrationHelpers } from "~testing/integration/domain-service/org-membership.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { OrgMembershipStatus } from "~context/enums";
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
            const project = await suite.fixtures().createProject({ organization });
            const unrelatedProject = await suite.fixtures().createProject({ organization });
            const department = await suite.fixtures().createDepartment({ organization });
            const team = await suite.fixtures().createTeam({ department, organization });
            await suite.fixtures().createProjectAccountAssignment({ membership, project });
            await suite.fixtures().createDeptAccountAssignment({ membership, department });
            await suite.fixtures().createTeamAccountAssignment({ membership, team });

            const result = await suite.transaction((transaction) =>
                suite.repository().membershipService[operation]({
                    account: membership.account,
                    identifiers: [membership.id],
                    realm: organization.realm,
                    transaction,
                }),
            );

            expect(result.access.map(({ realm }) => realm).sort()).toEqual(
                [organization.realm, project.realm, unrelatedProject.realm].sort(),
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

    it("rejects resume after leaving without bypassing the join process", async () => {
        const organization = await suite.fixtures().createOrganization();
        const membership = await suite.fixtures().createOrgMembership({ organization });
        await suite.transaction(async (transaction) => {
            const entity = await transaction.findOneOrFail(OrgMembership, membership.id);
            entity.leave();
        });

        await expect(
            suite.transaction((transaction) =>
                suite.repository().membershipService.resume({
                    identifiers: [membership.id],
                    realm: organization.realm,
                    transaction,
                }),
            ),
        ).rejects.toThrow("CANNOT_ACTIVATE");

        await expect(
            suite.transaction((transaction) =>
                transaction.count(OrgMembership, { id: membership.id, status: OrgMembershipStatus.LEFT }),
            ),
        ).resolves.toBe(1);
    });

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
