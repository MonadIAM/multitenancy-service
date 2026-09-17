import { CoreFixture } from "./core.fixture";

export class OrganizationFixture extends CoreFixture implements Fixtures.Organization.Contract {
    public async filterScenario(): Fixtures.Organization.FilterScenario.Result {
        const matched = await this.createOrganization({ title: "Alpha Organization" });

        await this.createOrganization({ title: "Beta Organization" });

        return { matched };
    }

    public async lookupSearchScenario(): Fixtures.Organization.LookupSearchScenario.Result {
        await this.createOrganization({ title: "Platform Alpha" });
        await this.createOrganization({ title: "Billing Audit" });

        const exact = await this.createOrganization({ title: "Alpha Platform" });

        return {
            expectedTitles: ["Alpha Platform", "Platform Alpha"],
            term: "Alpha Platform",
            exact,
        };
    }
}
