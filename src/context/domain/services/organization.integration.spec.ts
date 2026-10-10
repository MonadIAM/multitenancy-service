import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { OrganizationIntegrationHelpers } from "~testing/integration/domain-service/organization.helpers";
import { MembershipIntegrationHelpers } from "~testing/integration/domain-service/membership.helpers";
import { RealmType, OrganizationStatus, MembershipStatus, PlatformService } from "~context/enums";
import { AccountIntegrationHelpers } from "~testing/integration/domain-service/account.helpers";
import { ConcurrencyIntegrationHelpers } from "~testing/integration/concurrency.helpers";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import {
    ProjectAccountAssignment,
    Organization,
    Membership,
    Department,
    Project,
    Invite,
    Team,
} from "~context/domain/entities";

const helpers = new OrganizationIntegrationHelpers();

describe("OrganizationService integration", () => {
    const suite = postgresSuite({
        repository: (context) => ({
            ...helpers.service(context),
            ...new MembershipIntegrationHelpers().service(context),
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
                    transaction.count(Membership, {
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
            ).resolves.toEqual({ realms: [] });

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

            await suite.transaction((transaction) =>
                suite.repository().organizationService.confirmBootstrap({
                    ...request,
                    input: { ...request.input, service: PlatformService.HR_SERVICE },
                    transaction,
                }),
            );

            const [organization, membership] = await suite.transaction((transaction) =>
                Promise.all([
                    transaction.findOneOrFail(Organization, result.organization.id),
                    transaction.findOneOrFail(Membership, result.membership.id),
                ]),
            );
            expect(organization.status).toBe(OrganizationStatus.ACTIVE);
            expect(organization.process).toBeNull();
            expect(membership.status).toBe(MembershipStatus.ACTIVE);
        });
    });

    describe("bootstrap concurrency and rollback", () => {
        it("preserves both concurrent confirmations", async () => {
            const { organizationService, concurrency } = suite.repository();
            const actor = randomUUID();
            const { organization, membership } = await suite.transaction((transaction) =>
                Promise.resolve(
                    organizationService.create({
                        actor,
                        input: { title: "Pending", description: "Description" },
                        transaction,
                    }),
                ),
            );
            const request = {
                actor,
                realm: organization.realm,
                input: { type: RealmType.ORGANIZATION as const, process: organization.process!, resource: organization.id },
            };

            const result = await concurrency.run({
                first: (transaction) => organizationService.confirmBootstrap({ ...request, transaction }),
                second: (transaction) =>
                    organizationService.confirmBootstrap({
                        ...request,
                        input: { ...request.input, service: PlatformService.HR_SERVICE },
                        transaction,
                    }),
            });

            expect(result.second.status).toBe("fulfilled");

            const loaded = await suite.transaction((transaction) =>
                transaction.findOneOrFail(Organization, organization.id),
            );

            expect(loaded.status).toBe(OrganizationStatus.ACTIVE);
            expect(loaded.bootstrapPending).toEqual([]);

            const owner = await suite.transaction((transaction) => transaction.findOneOrFail(Membership, membership.id));

            expect(owner.status).toBe(MembershipStatus.ACTIVE);
        });

        it("deletes the provisional organization and owner together and compensates a late confirmation", async () => {
            const { organizationService } = suite.repository();
            const actor = randomUUID();
            const { organization, membership } = await suite.transaction((transaction) =>
                Promise.resolve(
                    organizationService.create({
                        actor,
                        input: { title: "Pending", description: "Description" },
                        transaction,
                    }),
                ),
            );
            const request = {
                actor,
                realm: organization.realm,
                input: { type: RealmType.ORGANIZATION as const, process: organization.process!, resource: organization.id },
            };

            await suite.transaction((transaction) => organizationService.confirmBootstrap({ ...request, transaction }));

            await expect(
                suite.transaction((transaction) =>
                    organizationService.rejectBootstrap({
                        ...request,
                        input: { ...request.input, reason: "HR rejected" },
                        transaction,
                    }),
                ),
            ).resolves.toEqual({ realms: [{ realm: organization.realm }] });
            await expect(
                suite.transaction((transaction) =>
                    Promise.all([
                        transaction.count(Organization, organization.id),
                        transaction.count(Membership, membership.id),
                    ]),
                ),
            ).resolves.toEqual([0, 0]);
            await expect(
                suite.transaction((transaction) =>
                    organizationService.confirmBootstrap({
                        ...request,
                        input: { ...request.input, service: PlatformService.HR_SERVICE },
                        transaction,
                    }),
                ),
            ).resolves.toEqual({ realms: [{ realm: organization.realm }] });
        });
    });

    describe("transferOwnership / confirmTransfer", () => {
        it("keeps the previous owner until transfer confirmation", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createMembership({ organization });
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
                const membership = await suite.fixtures().createMembership({ organization });
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
                        message: "services.membership.OWNER_ACCESS_REQUIRED",
                    }),
                });
                const loaded = await suite.transaction((transaction) =>
                    transaction.findOneOrFail(Membership, membership.id),
                );
                expect(loaded.status).toBe(MembershipStatus.ACTIVE);
                expect(result.first.organization.pendingOwner).toBe(membership.id);
            },
        );

        it.each([
            { operation: "leave" as const, status: MembershipStatus.LEFT },
            { operation: "block" as const, status: MembershipStatus.BLOCKED },
            {
                operation: "suspend" as const,
                status: MembershipStatus.SUSPENDED,
            },
        ])(
            "rejects transfer after concurrent $operation changes the candidate membership",
            async ({ operation, status }) => {
                const organization = await suite.fixtures().createOrganization();
                const membership = await suite.fixtures().createMembership({ organization });
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
                        await transaction.findOneOrFail(Membership, membership.id);

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
                        transaction.findOneOrFail(Membership, membership.id),
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
                const membership = await suite.fixtures().createMembership({ organization });
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
                        transaction.findOneOrFail(Membership, membership.id),
                    ]),
                );
                expect(loaded.pendingOwner).toBeNull();
                expect(loaded.process).toBeNull();
                expect(loaded.owner.id).toBe(operation === "confirmTransfer" ? membership.id : organization.owner.id);
                expect(candidate.status).toBe(
                    operation === "confirmTransfer" ? MembershipStatus.ACTIVE : MembershipStatus.LEFT,
                );
            },
        );

        it("rejects account purge after a concurrent transfer reserves the next owner", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createMembership({ organization });
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
            await expect(suite.transaction((transaction) => transaction.count(Membership, membership.id))).resolves.toBe(1);
        });

        it("rejects transfer after a concurrent account purge removes the candidate", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createMembership({ organization });
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
            await expect(suite.transaction((transaction) => transaction.count(Membership, membership.id))).resolves.toBe(0);
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

    describe("purge cascades", () => {
        it("deletes all owned rows while preserving another organization and collecting project realms", async () => {
            const organization = await suite.fixtures().createOrganization();
            const foreign = await suite.fixtures().createOrganization();
            const project = await suite.fixtures().createProject({ organization });
            const department = await suite.fixtures().createDepartment({ organization });
            await suite.fixtures().createTeam({ department });
            await suite.fixtures().createInvite({ organization });
            const assignment = await suite
                .fixtures()
                .createProjectAccountAssignment({ project, membership: organization.owner });
            await suite.transaction(async (transaction) => {
                await transaction.nativeUpdate(Project, project.id, { manager: assignment.id });
                await transaction.nativeUpdate(Organization, organization.id, { status: OrganizationStatus.REVOKED });
            });

            const result = await suite.transaction(async (transaction) => {
                const result = await suite.repository().organizationService.purge({
                    identifiers: [organization.id],
                    actor: organization.owner.account,
                    global: false,
                    transaction,
                });
                await transaction.flush();
                return result;
            });

            expect(result.realms.map(({ realm }) => realm).sort()).toEqual([organization.realm, project.realm].sort());
            await expect(
                suite.transaction((transaction) =>
                    Promise.all([
                        transaction.count(Organization, organization.id),
                        transaction.count(Membership, { organization: organization.id }),
                        transaction.count(Project, { organization: organization.id }),
                        transaction.count(ProjectAccountAssignment, { organization: organization.id }),
                        transaction.count(Department, { organization: organization.id }),
                        transaction.count(Team, { organization: organization.id }),
                        transaction.count(Invite, { organization: organization.id }),
                        transaction.count(Organization, foreign.id),
                        transaction.count(Membership, foreign.owner.id),
                    ]),
                ),
            ).resolves.toEqual([0, 0, 0, 0, 0, 0, 0, 1, 1]);
        });

        it("still rejects deleting a department with teams", async () => {
            const organization = await suite.fixtures().createOrganization();
            const department = await suite.fixtures().createDepartment({ organization });
            const team = await suite.fixtures().createTeam({ department });

            const result = suite.transaction((transaction) => transaction.nativeDelete(Department, department.id));

            await expect(result).rejects.toThrow();
            await expect(suite.transaction((transaction) => transaction.count(Team, team.id))).resolves.toBe(1);
        });

        it("still rejects deleting a membership with project assignments", async () => {
            const organization = await suite.fixtures().createOrganization();
            const membership = await suite.fixtures().createMembership({ organization });
            const project = await suite.fixtures().createProject({ organization });
            const assignment = await suite.fixtures().createProjectAccountAssignment({ membership, project });

            const result = suite.transaction((transaction) => transaction.nativeDelete(Membership, membership.id));

            await expect(result).rejects.toThrow();
            await expect(
                suite.transaction((transaction) => transaction.count(ProjectAccountAssignment, assignment.id)),
            ).resolves.toBe(1);
        });
    });
});
