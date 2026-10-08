import { randomUUID } from "node:crypto";

import { CoreFixture } from "./core.fixture";

export class MembershipFixture extends CoreFixture implements Fixtures.Membership.Contract {
    public async filterScenario(): Fixtures.Membership.FilterScenario.Result {
        const account = randomUUID();

        const organization = await this.createOrganization();
        const matched = await this.createMembership({ organization, account });

        await this.createMembership({ organization });

        return { organization, matched, account };
    }
}
