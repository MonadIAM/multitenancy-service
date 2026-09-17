import { CoreFixture } from "./core.fixture";

export class ProjectFixture extends CoreFixture implements Fixtures.Project.Contract {
    public async filterScenario(): Fixtures.Project.FilterScenario.Result {
        const organization = await this.createOrganization();
        const matched = await this.createProject({ organization, name: "Alpha Project" });

        await this.createProject({ organization, name: "Beta Project" });

        return { organization, matched };
    }

    public async lookupSearchScenario(): Fixtures.Project.LookupSearchScenario.Result {
        const organization = await this.createOrganization();
        const external = await this.createOrganization();
        const exact = await this.createProject({ organization, name: "Alpha Platform" });

        await this.createProject({ organization, name: "Platform Alpha" });
        await this.createProject({ organization: external, name: "Alpha Platform" });

        return {
            expectedNames: ["Alpha Platform", "Platform Alpha"],
            term: "Alpha Platform",
            organization,
            exact,
        };
    }
}
