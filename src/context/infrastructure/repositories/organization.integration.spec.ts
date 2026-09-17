import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { OrganizationFixture } from "~testing/integration/repositories/organization.fixture";
import { PublicStringOperator } from "~infrastructure/database/enums";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { OrganizationStatus } from "~context/enums";

import { OrganizationRepository } from "./organization.repository";

describe("OrganizationRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new OrganizationRepository(readManager),
        fixture: (entityManager) => new OrganizationFixture(entityManager),
    });

    it("maps the persisted organization through the schema", async () => {
        const organization = await suite.fixtures().createOrganization({
            description: "Mapping organization description",
            title: "Mapping Organization",
        });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: organization.id } });

        expect(loaded).toMatchObject({
            description: "Mapping organization description",
            status: OrganizationStatus.ACTIVE,
            createdAt: organization.createdAt,
            version: organization.version,
            title: "Mapping Organization",
            realm: organization.realm,
            id: organization.id,
        });
        expect(loaded.owner.id).toBe(organization.owner.id);
    });

    it("finds organizations by title and status mapper filters", async () => {
        const { matched } = await suite.fixtures().filterScenario();

        const [organizations, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { createdAt: QueryOrder.ASC },
            filters: {
                title: { operator: PublicStringOperator.ILIKE, value: "Alpha" },
                status: { operator: PublicStringOperator.EQUAL, value: OrganizationStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(organizations.map(({ id }) => id)).toEqual([matched.id]);
    });

    it("uses trigram lookup with stable title tie-breakers", async () => {
        const scenario = await suite.fixtures().lookupSearchScenario();

        const [organizations, total] = await suite.repository().getLookupList({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            term: scenario.term,
        });

        expect(total).toBe(2);
        expect(organizations[0]?.id).toBe(scenario.exact.id);
        expect(organizations.map(({ title }) => title)).toEqual(scenario.expectedTitles);
    });
});
