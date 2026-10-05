import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { OrgMembershipIntegrationHelpers } from "~testing/integration/domain-service/org-membership.helpers";
import { ProjectAccountAssignment, OrgMembership } from "~context/domain/entities";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { OrgMembershipStatus } from "~context/enums";

const helpers = new OrgMembershipIntegrationHelpers();

describe("OrgMembershipService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    describe("leave / block", () => {
        it.each([
            { operation: "leave", expectedStatus: OrgMembershipStatus.LEFT },
            { operation: "block", expectedStatus: OrgMembershipStatus.BLOCKED },
        ] as const)(
            "$operation changes membership status and cleans project assignments",
            async ({ operation, expectedStatus }) => {
                const organization = await suite.fixtures().createOrganization();
                const membership = await suite.fixtures().createOrgMembership({ organization });
                const project = await suite.fixtures().createProject({ organization });
                const unrelatedProject = await suite.fixtures().createProject({ organization });
                await suite.fixtures().createProjectAccountAssignment({ membership, project });

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
                const [loaded, projectCount] = await suite.transaction(
                    async (transaction) =>
                        await Promise.all([
                            transaction.findOneOrFail(OrgMembership, { id: membership.id }),
                            transaction.count(ProjectAccountAssignment, { membership: { id: membership.id } }),
                        ]),
                );
                expect(loaded.status).toBe(expectedStatus);
                expect(projectCount).toBe(0);
            },
        );
    });

    describe("resume", () => {
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
    });

    describe("join", () => {
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
});
