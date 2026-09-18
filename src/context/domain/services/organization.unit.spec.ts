import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { OrganizationUnitHelpers } from "~testing/unit/domain-service/organization.helpers";
import { OrganizationStatus } from "~context/enums";

/* eslint-disable prettier/prettier */
const ORGANIZATION_ID = "00000000-0000-4000-8000-100000000001";
const MEMBERSHIP_ID   = "00000000-0000-4000-8000-100000000002";
const ACTOR_ID        = "00000000-0000-4000-8000-100000000003";
/* eslint-enable prettier/prettier */

const helpers = new OrganizationUnitHelpers();

describe("OrganizationService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("creates an organization with its owner membership and persists both", () => {
        const { service, transaction } = helpers.service();

        const result = service.create({
            input: {
                realm: "realm",
                title: "Organization",
                description: "Description",
            },
            transaction: transaction.entityManager,
            actor: ACTOR_ID,
        });

        expect(result.organization.owner).toBe(result.membership);
        expect(result.membership.account).toBe(ACTOR_ID);
        expect(transaction.persist).toHaveBeenNthCalledWith(1, result.organization);
        expect(transaction.persist).toHaveBeenNthCalledWith(2, result.membership);
    });

    it("updates and transfers ownership using scoped repository lookups", async () => {
        const organization = helpers.createOrganization({
            id: ORGANIZATION_ID,
        });
        const membership = helpers.createOrgMembership({
            id: MEMBERSHIP_ID,
            organization,
        });
        const { service, repositories, transaction } = helpers.service({
            organizations: [organization],
        });
        repositories.memberships.findUniqueOrThrow.mockImplementation(() => Promise.resolve(membership));
        const updateSpy = jest.spyOn(organization, "update");

        await service.update({
            realm: organization.realm,
            id: ORGANIZATION_ID,
            patch: { title: "Updated" },
            transaction: transaction.entityManager,
        });
        const result = await service.transferOwnership({
            realm: organization.realm,
            id: ORGANIZATION_ID,
            membership: MEMBERSHIP_ID,
            transaction: transaction.entityManager,
        });

        expect(updateSpy).toHaveBeenCalledWith({ patch: { title: "Updated" } });
        expect(repositories.organizations.findUniqueOrThrow).toHaveBeenCalledWith({
            where: { id: ORGANIZATION_ID, realm: organization.realm },
            transaction: transaction.entityManager,
        });
        expect(repositories.memberships.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
                id: MEMBERSHIP_ID,
                organization: ORGANIZATION_ID,
                status: "ACTIVE",
            },
            transaction: transaction.entityManager,
        });
        expect(result.owner).toBe(membership);
    });

    it("deduplicates bulk identifiers and rejects incomplete repository results", async () => {
        const organization = helpers.createOrganization({
            id: ORGANIZATION_ID,
        });
        const { service, repositories, transaction } = helpers.service({
            organizations: [organization],
        });

        await expect(
            service.revoke({
                realm: organization.realm,
                identifiers: [ORGANIZATION_ID, ORGANIZATION_ID],
                transaction: transaction.entityManager,
            }),
        ).resolves.toEqual([organization]);

        expect(repositories.organizations.find).toHaveBeenCalledWith({
            where: { id: { $in: [ORGANIZATION_ID] }, realm: organization.realm },
            transaction: transaction.entityManager,
        });

        repositories.organizations.find.mockImplementation(() => Promise.resolve([]));

        await expect(
            service.restore({
                realm: organization.realm,
                identifiers: [ORGANIZATION_ID],
                transaction: transaction.entityManager,
            }),
        ).rejects.toThrow("services.organization.ORGANIZATIONS_NOT_FOUND");
    });

    it("checks purge eligibility and removes revoked organizations", async () => {
        const organization = helpers.createOrganization({
            id: ORGANIZATION_ID,
            status: OrganizationStatus.REVOKED,
        });
        const { service, transaction } = helpers.service({
            organizations: [organization],
        });
        const canPurgeSpy = jest.spyOn(organization, "canPurge");

        await expect(
            service.purge({
                realm: organization.realm,
                identifiers: [ORGANIZATION_ID],
                transaction: transaction.entityManager,
            }),
        ).resolves.toEqual([organization]);

        expect(canPurgeSpy).toHaveBeenCalledTimes(1);
        expect(transaction.remove).toHaveBeenCalledWith(organization);
    });
});
