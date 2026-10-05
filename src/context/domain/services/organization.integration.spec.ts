import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { OrgMembershipIntegrationHelpers } from "~testing/integration/domain-service/org-membership.helpers";
import { OrganizationIntegrationHelpers } from "~testing/integration/domain-service/organization.helpers";
import { AccountIntegrationHelpers } from "~testing/integration/domain-service/account.helpers";
import { ConcurrencyIntegrationHelpers } from "~testing/integration/concurrency.helpers";
import { RealmType, OrganizationStatus, OrgMembershipStatus } from "~context/enums";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { Organization, OrgMembership } from "~context/domain/entities";

const helpers = new OrganizationIntegrationHelpers();

describe("OrganizationService integration", () => {
    const suite = postgresSuite({
        repository: (context) => ({
            ...helpers.service(context),
            ...new OrgMembershipIntegrationHelpers().service(context),
            ...new AccountIntegrationHelpers().service(context),
            concurrency: new ConcurrencyIntegrationHelpers(context),
        }),
        fixture: (manager) => new CoreFixture(manager),
    });

    describe("create", () => {
        it("creates one persisted organization with its owner membership", async () => {
            const actor = randomUUID();

            const result = await suite.transaction((transaction) =>
                Promise.resolve(
                    suite.repository().organizationService.create({
                        input: { title: "Created", description: "Description" },
                        transaction,
                        actor,
                    }),
                ),
            );

            await expect(
                suite.transaction((transaction) => transaction.count(Organization, { id: result.organization.id })),
            ).resolves.toBe(1);
            await expect(
                suite.transaction((transaction) =>
                    transaction.count(OrgMembership, {
                        id: result.membership.id,
                        account: actor,
                    }),
                ),
            ).resolves.toBe(1);
        });
    });

    describe("create / confirmBootstrap", () => {
        it("activates the organization and owner only for the matching bootstrap process", async () => {
            const actor = randomUUID();
            const result = await suite.transaction((transaction) =>
                Promise.resolve(
                    suite.repository().organizationService.create({
                        actor,
                        transaction,
                        input: { title: "Pending", description: "Pending" },
                    }),
                ),
            );
            const request = {
                actor,
                realm: result.organization.realm,
                input: {
                    type: RealmType.ORGANIZATION as const,
                    resource: result.organization.id,
                    process: result.organization.process!,
                },
            };
            await expect(
                suite.transaction((transaction) =>
                    suite.repository().organizationService.confirmBootstrap({
                        ...request,
                        input: { ...request.input, process: randomUUID() },
                        transaction,
                    }),
                ),
            ).rejects.toThrow("services.workflow.OPERATION_CONFLICT");

            const pending = await suite.transaction((transaction) =>
                transaction.findOneOrFail(Organization, result.organization.id),
            );
            expect(pending.status).toBe(OrganizationStatus.PROVISIONING);

            await suite.transaction((transaction) =>
                suite.repository().organizationService.confirmBootstrap({
                    ...request,
                    transaction,
                }),
            );

            const [organization, membership] = await suite.transaction((transaction) =>
                Promise.all([
                    transaction.findOneOrFail(Organization, result.organization.id),
                    transaction.findOneOrFail(OrgMembership, result.membership.id),
                ]),
            );
            expect(organization.status).toBe(OrganizationStatus.ACTIVE);
            expect(organization.process).toBeNull();
            expect(membership.status).toBe(OrgMembershipStatus.ACTIVE);
        });
    });

    describe("transferOwnership / confirmTransfer", () => {
        it("keeps the previous owner until transfer confirmation", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createOrgMembership({ organization });
            const started = await suite.transaction((transaction) =>
                suite.repository().organizationService.transferOwnership({
                    realm: organization.realm,
                    id: organization.id,
                    membership: membership.id,
                    transaction,
                }),
            );
            const request = {
                actor: organization.owner.account,
                realm: organization.realm,
                input: {
                    process: started.organization.process!,
                    organization: organization.id,
                    owner: membership.account,
                    previousOwner: organization.owner.account,
                },
            };
            expect(started.organization.owner.id).toBe(organization.owner.id);

            await suite.transaction((transaction) =>
                suite.repository().organizationService.confirmTransfer({
                    ...request,
                    transaction,
                }),
            );

            const confirmed = await suite.transaction((transaction) =>
                transaction.findOneOrFail(Organization, organization.id),
            );
            expect(confirmed.owner.id).toBe(membership.id);
            expect(confirmed.process).toBeNull();
            await expect(
                suite.transaction((transaction) =>
                    suite.repository().organizationService.confirmTransfer({
                        ...request,
                        transaction,
                    }),
                ),
            ).rejects.toThrow("services.workflow.OPERATION_CONFLICT");
        });
    });

    describe("revoke", () => {
        it("rolls back the whole bulk transition when one organization is missing", async () => {
            const organization = await suite.fixtures().createOrganization();

            await expect(
                suite.transaction((transaction) =>
                    suite.repository().organizationService.revoke({
                        identifiers: [organization.id, randomUUID()],
                        actor: organization.owner.account,
                        global: false,
                        transaction,
                    }),
                ),
            ).rejects.toThrow("services.organization.ORGANIZATIONS_NOT_FOUND");

            const loaded = await suite.transaction((transaction) =>
                transaction.findOneOrFail(Organization, { id: organization.id }),
            );
            expect(loaded.status).toBe("ACTIVE");
        });
    });

    describe("concurrent ownership transfer", () => {
        it.each(["leave", "block", "suspend"] as const)(
            "rejects %s after a concurrent transfer reserves the next owner",
            async (operation) => {
                const organization = await suite.fixtures().createOrganization();
                const membership = await suite.fixtures().createOrgMembership({ organization });
                const { organizationService, membershipService, concurrency } = suite.repository();

                const result = await concurrency.run({
                    first: (transaction) =>
                        organizationService.transferOwnership({
                            realm: organization.realm,
                            id: organization.id,
                            membership: membership.id,
                            transaction,
                        }),
                    second: async (transaction) => {
                        await transaction.findOneOrFail(Organization, organization.id);

                        return membershipService[operation]({
                            realm: organization.realm,
                            identifiers: [membership.id],
                            account: membership.account,
                            transaction,
                        });
                    },
                });

                expect(result.second).toEqual({
                    status: "rejected",
                    reason: expect.objectContaining({
                        message: "services.org-membership.OWNER_ACCESS_REQUIRED",
                    }),
                });
                const loaded = await suite.transaction((transaction) =>
                    transaction.findOneOrFail(OrgMembership, membership.id),
                );
                expect(loaded.status).toBe(OrgMembershipStatus.ACTIVE);
                expect(result.first.organization.pendingOwner).toBe(membership.id);
            },
        );

        it.each([
            { operation: "leave" as const, status: OrgMembershipStatus.LEFT },
            { operation: "block" as const, status: OrgMembershipStatus.BLOCKED },
            {
                operation: "suspend" as const,
                status: OrgMembershipStatus.SUSPENDED,
            },
        ])(
            "rejects transfer after concurrent $operation changes the candidate membership",
            async ({ operation, status }) => {
                const organization = await suite.fixtures().createOrganization();
                const membership = await suite.fixtures().createOrgMembership({ organization });
                const { organizationService, membershipService, concurrency } = suite.repository();

                const result = await concurrency.run({
                    first: (transaction) =>
                        membershipService[operation]({
                            realm: organization.realm,
                            identifiers: [membership.id],
                            account: membership.account,
                            transaction,
                        }),
                    second: async (transaction) => {
                        await transaction.findOneOrFail(OrgMembership, membership.id);

                        return organizationService.transferOwnership({
                            realm: organization.realm,
                            id: organization.id,
                            membership: membership.id,
                            transaction,
                        });
                    },
                });

                expect(result.second.status).toBe("rejected");
                const [loaded, candidate] = await suite.transaction((transaction) =>
                    Promise.all([
                        transaction.findOneOrFail(Organization, organization.id),
                        transaction.findOneOrFail(OrgMembership, membership.id),
                    ]),
                );
                expect(loaded.owner.id).toBe(organization.owner.id);
                expect(loaded.pendingOwner).toBeNull();
                expect(loaded.process).toBeNull();
                expect(candidate.status).toBe(status);
            },
        );

        it.each(["confirmTransfer", "rejectTransfer"] as const)(
            "checks owner protection after concurrent %s finishes",
            async (operation) => {
                const organization = await suite.fixtures().createOrganization();
                const membership = await suite.fixtures().createOrgMembership({ organization });
                const { organizationService, membershipService, concurrency } = suite.repository();
                const started = await suite.transaction((transaction) =>
                    organizationService.transferOwnership({
                        realm: organization.realm,
                        id: organization.id,
                        membership: membership.id,
                        transaction,
                    }),
                );

                const result = await concurrency.run({
                    first: async (transaction) => {
                        await organizationService[operation]({
                            actor: organization.owner.account,
                            realm: organization.realm,
                            input: {
                                process: started.organization.process!,
                                organization: organization.id,
                                previousOwner: organization.owner.account,
                                owner: membership.account,
                                reason: "Rejected",
                            },
                            transaction,
                        });
                    },
                    second: (transaction) =>
                        membershipService.leave({
                            realm: organization.realm,
                            identifiers: [membership.id],
                            account: membership.account,
                            transaction,
                        }),
                });

                expect(result.second.status).toBe(operation === "confirmTransfer" ? "rejected" : "fulfilled");
                const [loaded, candidate] = await suite.transaction((transaction) =>
                    Promise.all([
                        transaction.findOneOrFail(Organization, organization.id),
                        transaction.findOneOrFail(OrgMembership, membership.id),
                    ]),
                );
                expect(loaded.pendingOwner).toBeNull();
                expect(loaded.process).toBeNull();
                expect(loaded.owner.id).toBe(operation === "confirmTransfer" ? membership.id : organization.owner.id);
                expect(candidate.status).toBe(
                    operation === "confirmTransfer" ? OrgMembershipStatus.ACTIVE : OrgMembershipStatus.LEFT,
                );
            },
        );

        it("rejects account purge after a concurrent transfer reserves the next owner", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createOrgMembership({ organization });
            const { organizationService, accountService, concurrency } = suite.repository();

            const result = await concurrency.run({
                first: (transaction) =>
                    organizationService.transferOwnership({
                        realm: organization.realm,
                        id: organization.id,
                        membership: membership.id,
                        transaction,
                    }),
                second: (transaction) =>
                    accountService.purge({
                        account: membership.account,
                        transaction,
                    }),
            });

            expect(result.second).toEqual({
                status: "rejected",
                reason: expect.objectContaining({
                    message: "services.account.TRANSFER_PENDING",
                }),
            });
            await expect(suite.transaction((transaction) => transaction.count(OrgMembership, membership.id))).resolves.toBe(
                1,
            );
        });

        it("rejects transfer after a concurrent account purge removes the candidate", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createOrgMembership({ organization });
            const { organizationService, accountService, concurrency } = suite.repository();

            const result = await concurrency.run({
                first: (transaction) =>
                    accountService.purge({
                        account: membership.account,
                        transaction,
                    }),
                second: (transaction) =>
                    organizationService.transferOwnership({
                        realm: organization.realm,
                        id: organization.id,
                        membership: membership.id,
                        transaction,
                    }),
            });

            expect(result.second.status).toBe("rejected");
            const loaded = await suite.transaction((transaction) =>
                transaction.findOneOrFail(Organization, organization.id),
            );
            expect(loaded.pendingOwner).toBeNull();
            expect(loaded.owner.id).toBe(organization.owner.id);
            await expect(suite.transaction((transaction) => transaction.count(OrgMembership, membership.id))).resolves.toBe(
                0,
            );
        });
    });

    describe("lifecycle ownership", () => {
        it.each(["revoke", "restore", "purge"] as const)(
            "rejects a mixed owned/foreign batch for %s without changing either target",
            async (method) => {
                const actor = randomUUID();
                const owned = await suite.fixtures().createOrganization({
                    ownerAccount: actor,
                });
                const foreign = await suite.fixtures().createOrganization({
                    ownerAccount: randomUUID(),
                });
                if (method !== "revoke") {
                    await suite.transaction((transaction) =>
                        transaction.nativeUpdate(
                            Organization,
                            { id: { $in: [owned.id, foreign.id] } },
                            { status: OrganizationStatus.REVOKED },
                        ),
                    );
                }

                const result = suite.transaction((transaction) =>
                    suite.repository().organizationService[method]({
                        actor,
                        global: false,
                        identifiers: [owned.id, foreign.id],
                        transaction,
                    }),
                );

                await expect(result).rejects.toThrow("services.organization.ORGANIZATIONS_NOT_FOUND");
                for await (const id of [owned.id, foreign.id]) {
                    const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Organization, id));
                    expect(loaded.status).toBe(
                        method === "revoke" ? OrganizationStatus.ACTIVE : OrganizationStatus.REVOKED,
                    );
                }
            },
        );

        it.each(["revoke", "restore", "purge"] as const)("permits global %s for another owner's target", async (method) => {
            const actor = randomUUID();
            const target = await suite.fixtures().createOrganization();
            if (method !== "revoke") {
                await suite.transaction((transaction) =>
                    transaction.nativeUpdate(Organization, { id: target.id }, { status: OrganizationStatus.REVOKED }),
                );
            }

            await suite.transaction((transaction) =>
                suite.repository().organizationService[method]({
                    actor,
                    global: true,
                    identifiers: [target.id],
                    transaction,
                }),
            );

            if (method === "purge") {
                await expect(
                    suite.transaction((transaction) => transaction.count(Organization, { id: target.id })),
                ).resolves.toBe(0);
            } else {
                const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Organization, target.id));
                expect(loaded.status).toBe(method === "revoke" ? OrganizationStatus.REVOKED : OrganizationStatus.ACTIVE);
            }
        });

        it("allows the owner to revoke, restore, revoke and purge without a target realm context", async () => {
            const actor = randomUUID();
            const target = await suite.fixtures().createOrganization({ ownerAccount: actor });

            for await (const method of ["revoke", "restore", "revoke", "purge"] as const) {
                await suite.transaction((transaction) =>
                    suite.repository().organizationService[method]({
                        actor,
                        global: false,
                        identifiers: [target.id],
                        transaction,
                    }),
                );
            }

            await expect(
                suite.transaction((transaction) => transaction.count(Organization, { id: target.id })),
            ).resolves.toBe(0);
        });
    });
});
