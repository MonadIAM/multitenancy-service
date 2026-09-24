import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { InviteFixture } from "~testing/integration/repositories/invite.fixture";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { InviteStatus } from "~context/enums";

import { InviteRepository } from "./invite.repository";

describe("InviteRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager, writeManager }) => new InviteRepository(readManager, writeManager),
        fixture: (entityManager) => new InviteFixture(entityManager),
    });

    it("maps the persisted invite through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const expiresAt = new Date("2030-01-01T00:00:00.000Z");
        const invite = await suite.fixtures().createInvite({ organization, expiresAt });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: invite.id } });

        expect(loaded).toMatchObject({
            status: InviteStatus.PENDING,
            createdAt: invite.createdAt,
            version: invite.version,
            expiresAt,
            invitee: invite.invitee,
            inviter: invite.inviter,
            role: invite.role,
            id: invite.id,
        });
        expect(loaded.organization.id).toBe(organization.id);
    });

    it("finds invites by organization, invitee and status mapper filters", async () => {
        const { organization, matched } = await suite.fixtures().filterScenario();

        const [invites, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { createdAt: QueryOrder.ASC },
            filters: {
                organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                invitee: { operator: PublicLinkOperator.EQUAL, value: matched.invitee },
                status: { operator: PublicStringOperator.EQUAL, value: InviteStatus.PENDING },
            },
        });

        expect(total).toBe(1);
        expect(invites.map(({ id }) => id)).toEqual([matched.id]);
    });

    it("finds only expired pending invites", async () => {
        const { expirationDate, expired } = await suite.fixtures().expirationScenario();

        const invites = await suite.repository().findExpiredPending({ expirationDate, batchSize: 10 });

        expect(invites.map(({ id, expiresAt }) => ({ id, expiresAt }))).toEqual([
            { id: expired.id, expiresAt: expired.expiresAt },
        ]);
    });
});
