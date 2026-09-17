import { CoreFixture } from "./core.fixture";

export class InviteFixture extends CoreFixture implements Fixtures.Invite.Contract {
    public async filterScenario(): Fixtures.Invite.FilterScenario.Result {
        const organization = await this.createOrganization();
        const matched = await this.createInvite({ organization });

        await this.createInvite({ organization });

        return { organization, matched };
    }

    public async expirationScenario(): Fixtures.Invite.ExpirationScenario.Result {
        const organization = await this.createOrganization();
        const expirationDate = new Date("2030-01-01T00:00:00.000Z");
        const expired = await this.createInvite({
            expiresAt: new Date("2029-12-31T23:59:59.000Z"),
            organization,
        });

        await this.createInvite({ expiresAt: new Date("2031-01-01T00:00:00.000Z"), organization });

        return { expirationDate, expired };
    }
}
