import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { LockMode } from "@mikro-orm/core";

import { OrganizationStatus, MembershipStatus, PlatformService, RealmType } from "~context/enums";
import { OrganizationUnitHelpers } from "~testing/unit/domain-service/organization.helpers";

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

    describe("bootstrap responses", () => {
        it.each([
            [PlatformService.ACCESS_CONTROL_SERVICE, PlatformService.HR_SERVICE],
            [PlatformService.HR_SERVICE, PlatformService.ACCESS_CONTROL_SERVICE],
        ] as const)("waits for both services when %s confirms first", async (first, second) => {
            const { service, repositories, transaction } = helpers.service();
            const { organization, membership } = service.create({
                input: { title: "Pending", description: "Description" },
                transaction: transaction.entityManager,
                actor: ACTOR_ID,
            });
            repositories.organizations.findUnique.mockImplementation(() => Promise.resolve(organization));
            const request = {
                actor: ACTOR_ID,
                realm: organization.realm,
                transaction: transaction.entityManager,
                input: {
                    type: RealmType.ORGANIZATION as const,
                    resource: organization.id,
                    process: organization.process!,
                },
            };

            await confirm(first);
            await confirm(first);

            expect(organization.status).toBe(OrganizationStatus.PROVISIONING);
            expect(membership.status).toBe(MembershipStatus.JOINING);
            expect(organization.bootstrapPending).toEqual([second]);

            await confirm(second);
            expect(organization.status).toBe(OrganizationStatus.ACTIVE);
            expect(membership.status).toBe(MembershipStatus.ACTIVE);
            expect(organization.process).toBeUndefined();
            expect(organization.bootstrapPending).toEqual([]);
            await expect(confirm(first)).resolves.toEqual({ realms: [] });

            function confirm(
                participant: PlatformService.ACCESS_CONTROL_SERVICE | PlatformService.HR_SERVICE,
            ): Services.Organization.ConfirmBootstrap.Result {
                return service.confirmBootstrap({
                    ...request,
                    input: { ...request.input, service: participant },
                });
            }
        });

        it.each([PlatformService.ACCESS_CONTROL_SERVICE, PlatformService.HR_SERVICE] as const)(
            "removes the organization and requests cleanup after %s succeeded and the other failed",
            async (participant) => {
                const { service, repositories, transaction } = helpers.service();
                const { organization } = service.create({
                    input: { title: "Pending", description: "Description" },
                    transaction: transaction.entityManager,
                    actor: ACTOR_ID,
                });
                repositories.organizations.findUnique.mockImplementation(() => Promise.resolve(organization));
                const request = {
                    actor: ACTOR_ID,
                    realm: organization.realm,
                    transaction: transaction.entityManager,
                    input: {
                        type: RealmType.ORGANIZATION as const,
                        resource: organization.id,
                        process: organization.process!,
                    },
                };
                await service.confirmBootstrap({ ...request, input: { ...request.input, service: participant } });

                await expect(
                    service.rejectBootstrap({ ...request, input: { ...request.input, reason: "Rejected" } }),
                ).resolves.toEqual({ realms: [{ realm: organization.realm }] });
                expect(transaction.remove).toHaveBeenCalledWith(organization);

                repositories.organizations.findUnique.mockImplementation(() => Promise.resolve(null));
                await expect(service.confirmBootstrap(request)).resolves.toEqual({
                    realms: [{ realm: organization.realm }],
                });
                expect(organization.status).toBe(OrganizationStatus.PROVISIONING);
            },
        );

        it("ignores a response from another process without changing either local entity", async () => {
            const { service, repositories, transaction } = helpers.service();
            const { organization, membership } = service.create({
                input: { title: "Pending", description: "Description" },
                transaction: transaction.entityManager,
                actor: ACTOR_ID,
            });
            repositories.organizations.findUnique.mockImplementation(() => Promise.resolve(organization));
            const request = {
                actor: ACTOR_ID,
                realm: organization.realm,
                transaction: transaction.entityManager,
                input: {
                    type: RealmType.ORGANIZATION as const,
                    resource: organization.id,
                    process: "stale",
                    reason: "Rejected",
                },
            };

            await expect(service.confirmBootstrap(request)).resolves.toEqual({ realms: [] });
            await expect(service.rejectBootstrap(request)).resolves.toEqual({ realms: [] });
            expect(organization.bootstrapPending).toHaveLength(2);
            expect(membership.status).toBe(MembershipStatus.JOINING);
            expect(transaction.remove).not.toHaveBeenCalled();
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
