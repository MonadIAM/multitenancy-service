import { describe, expect, it } from "@jest/globals";

import { OrganizationIntegrationHelpers } from "~testing/integration/domain-service/organization.helpers";
import { ProjectIntegrationHelpers } from "~testing/integration/domain-service/project.helpers";
import { ConcurrencyIntegrationHelpers } from "~testing/integration/concurrency.helpers";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { RealmType, OrganizationStatus, ProjectStatus } from "~context/enums";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { Organization, Project } from "~context/domain/entities";

const helpers = new ProjectIntegrationHelpers();

describe("ProjectService integration", () => {
    const suite = postgresSuite({
        repository: (context) => ({
            ...helpers.service(context),
            ...new OrganizationIntegrationHelpers().service(context),
            concurrency: new ConcurrencyIntegrationHelpers(context),
        }),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("creates and archives a project within its organization realm", async () => {
        const organization = await suite.fixtures().createOrganization();

        const project = await suite.transaction((transaction) =>
            suite.repository().projectService.create({
                input: {
                    organization: organization.id,
                    realm: organization.realm,
                    name: "Created",
                    description: "Description",
                },
                transaction,
            }),
        );

        await suite.transaction((transaction) =>
            suite.repository().projectService.confirmBootstrap({
                actor: organization.owner.account,
                realm: project.realm,
                input: {
                    type: RealmType.PROJECT,
                    resource: project.id,
                    process: project.process!,
                },
                transaction,
            }),
        );

        await suite.transaction((transaction) =>
            suite.repository().projectService.archive({
                identifiers: [project.id],
                realm: organization.realm,
                transaction,
            }),
        );

        const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Project, { id: project.id }));
        expect(loaded.status).toBe("ARCHIVED");
    });

    it("rejects project creation after a concurrent organization revoke", async () => {
        const organization = await suite.fixtures().createOrganization();
        const existing = await suite.fixtures().createProject({ organization });
        const { organizationService, projectService, concurrency } = suite.repository();

        const result = await concurrency.run({
            first: (transaction) =>
                organizationService.revoke({
                    identifiers: [organization.id],
                    realm: organization.realm,
                    transaction,
                }),
            second: (transaction) =>
                projectService.create({
                    input: {
                        organization: organization.id,
                        realm: organization.realm,
                        name: "Concurrent",
                        description: "",
                    },
                    transaction,
                }),
        });

        expect(result.second.status).toBe("rejected");
        expect(result.first.realms).toEqual(
            expect.arrayContaining([{ realm: organization.realm }, { realm: existing.realm }]),
        );
        await expect(
            suite.transaction((transaction) => transaction.count(Project, { organization: organization.id })),
        ).resolves.toBe(1);
        const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Organization, organization.id));
        expect(loaded.status).toBe(OrganizationStatus.REVOKED);
    });

    it("rejects organization revoke after concurrent creation starts a project bootstrap", async () => {
        const organization = await suite.fixtures().createOrganization();
        const { organizationService, projectService, concurrency } = suite.repository();

        const result = await concurrency.run({
            first: (transaction) =>
                projectService.create({
                    input: {
                        organization: organization.id,
                        realm: organization.realm,
                        name: "Concurrent",
                        description: "",
                    },
                    transaction,
                }),
            second: (transaction) =>
                organizationService.revoke({
                    identifiers: [organization.id],
                    realm: organization.realm,
                    transaction,
                }),
        });

        expect(result.second).toEqual({
            status: "rejected",
            reason: expect.objectContaining({
                message: "services.workflow.OPERATION_PENDING",
            }),
        });
        const [loaded, project] = await suite.transaction((transaction) =>
            Promise.all([
                transaction.findOneOrFail(Organization, organization.id),
                transaction.findOneOrFail(Project, result.first.id),
            ]),
        );
        expect(loaded.status).toBe(OrganizationStatus.ACTIVE);
        expect(project.status).toBe(ProjectStatus.PROVISIONING);
    });

    it.each(["confirmBootstrap", "rejectBootstrap"] as const)(
        "collects only existing realms after concurrent %s completes",
        async (operation) => {
            const organization = await suite.fixtures().createOrganization();
            const { organizationService, projectService, concurrency } = suite.repository();
            const project = await suite.transaction((transaction) =>
                projectService.create({
                    input: {
                        organization: organization.id,
                        realm: organization.realm,
                        name: "Pending",
                        description: "",
                    },
                    transaction,
                }),
            );

            const result = await concurrency.run({
                first: async (transaction) => {
                    await projectService[operation]({
                        actor: organization.owner.account,
                        realm: project.realm,
                        input: {
                            type: RealmType.PROJECT,
                            resource: project.id,
                            process: project.process!,
                            reason: "Rejected",
                        },
                        transaction,
                    });
                },
                second: (transaction) =>
                    organizationService.revoke({
                        identifiers: [organization.id],
                        realm: organization.realm,
                        transaction,
                    }),
            });

            const realms =
                operation === "confirmBootstrap"
                    ? [{ realm: organization.realm }, { realm: project.realm }]
                    : [{ realm: organization.realm }];
            expect(result.second).toEqual({
                status: "fulfilled",
                value: {
                    organizations: [
                        expect.objectContaining({
                            id: organization.id,
                            status: OrganizationStatus.REVOKED,
                        }),
                    ],
                    realms,
                },
            });
            const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Project, project.id));
            expect(loaded.status).toBe(operation === "confirmBootstrap" ? ProjectStatus.ACTIVE : ProjectStatus.FAILED);
            expect(loaded.process).toBeNull();
        },
    );

    it.each(["confirmBootstrap", "rejectBootstrap"] as const)(
        "allows %s after a competing revoke is rejected",
        async (operation) => {
            const organization = await suite.fixtures().createOrganization();
            const { organizationService, projectService, concurrency } = suite.repository();
            const project = await suite.transaction((transaction) =>
                projectService.create({
                    input: {
                        organization: organization.id,
                        realm: organization.realm,
                        name: "Pending",
                        description: "",
                    },
                    transaction,
                }),
            );

            const completion = await concurrency.run({
                first: async (transaction) => {
                    await expect(
                        organizationService.revoke({
                            identifiers: [organization.id],
                            realm: organization.realm,
                            transaction,
                        }),
                    ).rejects.toThrow("services.workflow.OPERATION_PENDING");
                },
                second: async (transaction) => {
                    await projectService[operation]({
                        actor: organization.owner.account,
                        realm: project.realm,
                        input: {
                            type: RealmType.PROJECT,
                            resource: project.id,
                            process: project.process!,
                            reason: "Rejected",
                        },
                        transaction,
                    });
                },
            });
            const result = await suite.transaction((transaction) =>
                organizationService.revoke({
                    identifiers: [organization.id],
                    realm: organization.realm,
                    transaction,
                }),
            );

            expect(completion.second.status).toBe("fulfilled");
            expect(result.realms).toEqual(
                operation === "confirmBootstrap"
                    ? [{ realm: organization.realm }, { realm: project.realm }]
                    : [{ realm: organization.realm }],
            );
        },
    );
});
