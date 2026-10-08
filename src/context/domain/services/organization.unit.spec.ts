import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { LockMode } from "@mikro-orm/core";

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

    describe("create", () => {
        it("creates an organization with its owner membership and persists both", () => {
            const { service, transaction } = helpers.service();

            const result = service.create({
                input: {
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
    });

    describe("update / transferOwnership", () => {
        it("updates and transfers ownership using scoped repository lookups", async () => {
            const organization = helpers.createOrganization({
                id: ORGANIZATION_ID,
            });
            const membership = helpers.createMembership({
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
                options: { refresh: true },
                transaction: transaction.entityManager,
            });
            expect(result.owner).toBe(membership.account);
            expect(result.organization.pendingOwner).toBe(membership.id);
            expect(result.organization.owner.id).not.toBe(membership.id);
        });
    });

    describe("revoke / restore", () => {
        it("deduplicates bulk identifiers and rejects incomplete repository results", async () => {
            const organization = helpers.createOrganization({
                id: ORGANIZATION_ID,
            });
            const { service, repositories, transaction } = helpers.service({
                organizations: [organization],
                projects: [],
            });

            await expect(
                service.revoke({
                    identifiers: [ORGANIZATION_ID, ORGANIZATION_ID],
                    transaction: transaction.entityManager,
                    actor: ACTOR_ID,
                    global: false,
                }),
            ).resolves.toEqual({
                organizations: [organization],
                realms: [{ realm: organization.realm }],
            });

            expect(repositories.organizations.find).toHaveBeenCalledWith({
                where: { id: { $in: [ORGANIZATION_ID] }, owner: { account: ACTOR_ID } },
                options: {
                    lockMode: LockMode.PESSIMISTIC_WRITE,
                    orderBy: { id: "ASC" },
                    refresh: true,
                },
                transaction: transaction.entityManager,
            });

            repositories.organizations.find.mockImplementation(() => Promise.resolve([]));

            await expect(
                service.restore({
                    transaction: transaction.entityManager,
                    identifiers: [ORGANIZATION_ID],
                    actor: ACTOR_ID,
                    global: false,
                }),
            ).rejects.toThrow("services.organization.ORGANIZATIONS_NOT_FOUND");
        });
    });

    describe("purge", () => {
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
                    transaction: transaction.entityManager,
                    identifiers: [ORGANIZATION_ID],
                    actor: ACTOR_ID,
                    global: false,
                }),
            ).resolves.toEqual({
                organizations: [organization],
                realms: [{ realm: organization.realm }],
            });

            expect(canPurgeSpy).toHaveBeenCalledTimes(1);
            expect(transaction.remove.mock.calls).toEqual([[[organization]]]);
        });
    });

    describe("purge / purgeOwned", () => {
        it.each(["purge", "purgeOwned"] as const)("rejects %s while a child process is pending", async (method) => {
            const organization = helpers.createOrganization({ status: OrganizationStatus.REVOKED });
            const { service, transaction, hasPendingProcesses } = helpers.service({ organizations: [organization] });
            hasPendingProcesses.mockResolvedValue(true);

            const result = service[method]({
                identifiers: [organization.id],
                account: ACTOR_ID,
                actor: ACTOR_ID,
                global: false,
                transaction: transaction.entityManager,
            });

            await expect(result).rejects.toThrow("services.workflow.OPERATION_CONFLICT");
            expect(hasPendingProcesses).toHaveBeenCalledWith({
                identifiers: [organization.id],
                transaction: transaction.entityManager,
            });
            expect(transaction.remove).not.toHaveBeenCalled();
        });

        it("rejects owner cleanup while the organization itself has a pending process", async () => {
            const organization = helpers.createOrganization({ process: "pending-process" });
            const { service, transaction } = helpers.service({ organizations: [organization] });

            const result = service.purgeOwned({ account: ACTOR_ID, transaction: transaction.entityManager });

            await expect(result).rejects.toThrow("services.workflow.OPERATION_CONFLICT");
            expect(transaction.remove).not.toHaveBeenCalled();
        });
    });
});
