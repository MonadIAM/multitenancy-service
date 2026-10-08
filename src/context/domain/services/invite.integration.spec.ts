import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { InviteIntegrationHelpers } from "~testing/integration/domain-service/invite.helpers";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { InviteStatus, MembershipStatus } from "~context/enums";
import { Invite, Membership } from "~context/domain/entities";

const helpers = new InviteIntegrationHelpers();

describe("InviteService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    describe("accept / confirmJoin", () => {
        it("accepts an invite and creates its membership atomically", async () => {
            const organization = await suite.fixtures().createOrganization();
            const invitee = randomUUID();
            const invite = await suite.fixtures().createInvite({ organization, invitee, role: randomUUID() });

            const result = await suite.transaction((transaction) =>
                suite.repository().inviteService.accept({
                    input: { invite: invite.id, invitee },
                    realm: organization.realm,
                    transaction,
                }),
            );

            const [loadedInvite, membershipCount] = await suite.transaction(
                async (transaction) =>
                    await Promise.all([
                        transaction.findOneOrFail(Invite, { id: invite.id }),
                        transaction.count(Membership, { id: result.membership.id, account: invitee }),
                    ]),
            );

            expect(loadedInvite.status).toBe("ACCEPTING");
            expect(membershipCount).toBe(1);

            await suite.transaction((transaction) =>
                suite.repository().inviteService.confirmJoin({
                    actor: invite.inviter,
                    realm: organization.realm,
                    input: {
                        process: result.membership.process!,
                        command: result.membership.process!,
                        membership: result.membership.id,
                        account: invitee,
                        invite: invite.id,
                        assignment: randomUUID(),
                        role: invite.role!,
                        joinedAt: Date.now(),
                    },
                    transaction,
                }),
            );

            await expect(
                suite.transaction((transaction) =>
                    transaction.count(Invite, { id: invite.id, status: InviteStatus.ACCEPTED }),
                ),
            ).resolves.toBe(1);
            await expect(
                suite.transaction((transaction) =>
                    transaction.count(Membership, { id: result.membership.id, status: MembershipStatus.ACTIVE }),
                ),
            ).resolves.toBe(1);
        });
    });
});
