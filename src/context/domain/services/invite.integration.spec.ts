import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { InviteIntegrationHelpers } from "~testing/integration/domain-service/invite.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { Invite, OrgMembership } from "~context/domain/entities";

const helpers = new InviteIntegrationHelpers();

describe("InviteService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("accepts an invite and creates its membership atomically", async () => {
        const organization = await suite.fixtures().createOrganization();
        const invitee = randomUUID();
        const invite = await suite.fixtures().createInvite({ organization, invitee, role: randomUUID() });

        const result = await suite.transaction((transaction) =>
            suite
                .repository()
                .inviteService.accept({ input: { invite: invite.id, invitee }, realm: organization.realm, transaction }),
        );

        const [loadedInvite, membershipCount] = await suite.transaction(
            async (transaction) =>
                await Promise.all([
                    transaction.findOneOrFail(Invite, { id: invite.id }),
                    transaction.count(OrgMembership, { id: result.membership.id, account: invitee }),
                ]),
        );

        expect(loadedInvite.status).toBe("ACCEPTED");
        expect(membershipCount).toBe(1);
    });
});
