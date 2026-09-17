import { randomUUID } from "node:crypto";

import { CoreFixture } from "./core.fixture";

export class OrgMembershipFixture extends CoreFixture implements Fixtures.OrgMembership.Contract {
    public async filterScenario(): Fixtures.OrgMembership.FilterScenario.Result {
        const account = randomUUID();

        const organization = await this.createOrganization();
        const matched = await this.createOrgMembership({ organization, account });

        await this.createOrgMembership({ organization });

        return { organization, matched, account };
    }
}
