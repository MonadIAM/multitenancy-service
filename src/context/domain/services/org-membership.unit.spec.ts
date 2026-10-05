import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { OrgMembershipUnitHelpers } from "~testing/unit/domain-service/org-membership.helpers";
import { OrgMembershipStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const REALM_ID        = "00000000-0000-4000-8000-100000000001";
const ORGANIZATION_ID = "00000000-0000-4000-8000-100000000002";
const MEMBERSHIP_ID   = "00000000-0000-4000-8000-100000000003";
const ACCOUNT_ID      = "00000000-0000-4000-8000-100000000004";
/* eslint-enable prettier/prettier */

const helpers = new OrgMembershipUnitHelpers();

describe("OrgMembershipService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("join", () => {
        it("creates and persists a membership when none exists", async () => {
            const organization = helpers.createOrganization({
                id: ORGANIZATION_ID,
                realm: REALM_ID,
            });
            const { service, repositories, transaction } = helpers.service({
                organizations: [organization],
            });
            repositories.memberships.findUnique.mockImplementation(() => Promise.resolve(null));

            const result = await service.join({
                input: { organization: ORGANIZATION_ID, account: ACCOUNT_ID },
                transaction: transaction.entityManager,
                realm: REALM_ID,
            });

            expect(result).toEqual(expect.objectContaining({ organization, account: ACCOUNT_ID }));
            expect(transaction.persist).toHaveBeenCalledWith(result);
        });

        it("reactivates a left membership and rejects every other existing status", async () => {
            const membership = helpers.createOrgMembership({
                id: MEMBERSHIP_ID,
                status: OrgMembershipStatus.LEFT,
            });
            const { service, repositories, transaction } = helpers.service({
                memberships: [membership],
            });
            repositories.memberships.findUnique.mockImplementation(() => Promise.resolve(membership));

            await expect(
                service.join({
                    input: {
                        organization: membership.organization.id,
                        account: ACCOUNT_ID,
                    },
                    transaction: transaction.entityManager,
                    realm: REALM_ID,
                }),
            ).resolves.toBe(membership);

            expect(membership.status).toBe(OrgMembershipStatus.JOINING);

            await expect(
                service.join({
                    input: {
                        organization: membership.organization.id,
                        account: ACCOUNT_ID,
                    },
                    transaction: transaction.entityManager,
                    realm: REALM_ID,
                }),
            ).rejects.toThrow("services.org-membership.MEMBERSHIP_ALREADY_EXISTS");
        });
    });

    describe("suspend / resume", () => {
        it("deduplicates identifiers and rejects incomplete bulk selections", async () => {
            const membership = helpers.createOrgMembership({ id: MEMBERSHIP_ID });
            const { service, repositories, transaction } = helpers.service({
                memberships: [membership],
            });

            await service.suspend({
                identifiers: [MEMBERSHIP_ID, MEMBERSHIP_ID],
                realm: REALM_ID,
                transaction: transaction.entityManager,
            });

            expect(repositories.memberships.find).toHaveBeenCalledWith({
                where: {
                    id: { $in: [MEMBERSHIP_ID] },
                    organization: { realm: REALM_ID },
                },
                options: { populate: ["organization"], refresh: true },
                transaction: transaction.entityManager,
            });

            repositories.memberships.find.mockImplementation(() => Promise.resolve([]));

            await expect(
                service.resume({
                    identifiers: [MEMBERSHIP_ID],
                    realm: REALM_ID,
                    transaction: transaction.entityManager,
                }),
            ).rejects.toThrow("services.org-membership.MEMBERSHIPS_NOT_FOUND");
        });
    });

    describe("leave / block", () => {
        it.each([
            {
                operation: "leave" as const,
                expectedStatus: OrgMembershipStatus.LEFT,
            },
            {
                operation: "block" as const,
                expectedStatus: OrgMembershipStatus.BLOCKED,
            },
        ])(
            "$operation performs the full business operation and returns its aggregate result",
            async ({ operation, expectedStatus }) => {
                const membership = helpers.createOrgMembership({
                    id: MEMBERSHIP_ID,
                });
                const projectAssignment = helpers.createProjectAccountAssignment({
                    membership,
                });
                const { service, services, repositories, transaction } = helpers.service({
                    memberships: [membership],
                });
                services.projectAssignments.clean.mockImplementation(() => Promise.resolve([projectAssignment]));

                const result = await service[operation]({
                    account: membership.account,
                    identifiers: [MEMBERSHIP_ID],
                    realm: REALM_ID,
                    transaction: transaction.entityManager,
                });

                expect(membership.status).toBe(expectedStatus);
                expect(repositories.memberships.find).toHaveBeenCalledWith({
                    where: {
                        id: { $in: [MEMBERSHIP_ID] },
                        organization: { realm: REALM_ID },
                        ...(operation === "leave" ? { account: membership.account } : {}),
                    },
                    options: { populate: ["organization"], refresh: true },
                    transaction: transaction.entityManager,
                });
                expect(services.projectAssignments.clean).toHaveBeenCalledWith({
                    memberships: [MEMBERSHIP_ID],
                    transaction: transaction.entityManager,
                });
                expect(result).toEqual({
                    access: [
                        {
                            realm: membership.organization.realm,
                            account: membership.account,
                        },
                    ],
                    memberships: [membership],
                    assignments: {
                        project: [projectAssignment],
                    },
                });
            },
        );
    });
});
