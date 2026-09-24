import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";
import { randomUUID } from "node:crypto";

import { OrgMembershipFixture } from "~testing/integration/repositories/org-membership.fixture";
import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { OrgMembershipStatus } from "~context/enums";

import { OrgMembershipRepository } from "./org-membership.repository";

describe("OrgMembershipRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new OrgMembershipRepository(readManager),
        fixture: (entityManager) => new OrgMembershipFixture(entityManager),
    });

    it("maps the persisted membership through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const account = randomUUID();
        const membership = await suite.fixtures().createOrgMembership({ organization, account });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: membership.id } });

        expect(loaded).toMatchObject({
            status: OrgMembershipStatus.ACTIVE,
            createdAt: membership.createdAt,
            joinedAt: membership.joinedAt,
            version: membership.version,
            account,
            id: membership.id,
        });
        expect(loaded.organization.id).toBe(organization.id);
    });

    it("finds memberships by organization, account and status mapper filters", async () => {
        const { organization, matched, account } = await suite.fixtures().filterScenario();

        const [memberships, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { createdAt: QueryOrder.ASC },
            filters: {
                organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                account: { operator: PublicLinkOperator.EQUAL, value: account },
                status: { operator: PublicStringOperator.EQUAL, value: OrgMembershipStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(memberships.map(({ id }) => id)).toEqual([matched.id]);
    });
});
