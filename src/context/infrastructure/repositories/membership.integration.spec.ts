import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";
import { randomUUID } from "node:crypto";

import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { MembershipFixture } from "~testing/integration/repositories/membership.fixture";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { MembershipStatus } from "~context/enums";

import { MembershipRepository } from "./membership.repository";

describe("MembershipRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new MembershipRepository(readManager),
        fixture: (entityManager) => new MembershipFixture(entityManager),
    });

    describe("findUniqueOrThrow", () => {
        it("maps the persisted membership through the schema", async () => {
            const organization = await suite.fixtures().createOrganization();
            const account = randomUUID();
            const membership = await suite.fixtures().createMembership({ organization, account });

            const loaded = await suite.repository().findUniqueOrThrow({ where: { id: membership.id } });

            expect(loaded).toMatchObject({
                status: MembershipStatus.ACTIVE,
                createdAt: membership.createdAt,
                joinedAt: membership.joinedAt,
                version: membership.version,
                account,
                id: membership.id,
            });
            expect(loaded.organization.id).toBe(organization.id);
        });
    });

    describe("findMany", () => {
        it("finds memberships by organization, account and status mapper filters", async () => {
            const { organization, matched, account } = await suite.fixtures().filterScenario();

            const [memberships, total] = await suite.repository().findMany({
                pagination: { currentPage: 1, elementsPerPage: 10 },
                sort: { createdAt: QueryOrder.ASC },
                filters: {
                    organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                    account: { operator: PublicLinkOperator.EQUAL, value: account },
                    status: { operator: PublicStringOperator.EQUAL, value: MembershipStatus.ACTIVE },
                },
            });

            expect(total).toBe(1);
            expect(memberships.map(({ id }) => id)).toEqual([matched.id]);
        });
    });
});
