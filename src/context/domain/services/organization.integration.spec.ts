import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { OrganizationIntegrationHelpers } from "~testing/integration/domain-service/organization.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { Organization, OrgMembership } from "~context/domain/entities";
import { postgresSuite } from "~testing/integration/postgres.suite";

const helpers = new OrganizationIntegrationHelpers();

describe("OrganizationService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("creates one persisted organization with its owner membership", async () => {
        const actor = randomUUID();

        const result = await suite.transaction((transaction) =>
            Promise.resolve(
                suite.repository().organizationService.create({
                    input: { realm: randomUUID(), title: "Created", description: "Description" },
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
                transaction.count(OrgMembership, { id: result.membership.id, account: actor }),
            ),
        ).resolves.toBe(1);
    });

    it("rolls back the whole bulk transition when one organization is missing", async () => {
        const organization = await suite.fixtures().createOrganization();

        await expect(
            suite.transaction((transaction) =>
                suite.repository().organizationService.revoke({
                    realm: organization.realm,
                    identifiers: [organization.id, randomUUID()],
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
