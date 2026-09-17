import { CoreFixture } from "./core.fixture";

export class TeamFixture extends CoreFixture implements Fixtures.Team.Contract {
    public async filterScenario(): Fixtures.Team.FilterScenario.Result {
        const organization = await this.createOrganization();
        const department = await this.createDepartment({ organization });
        const matched = await this.createTeam({ department, name: "Alpha Team" });

        await this.createTeam({ department, name: "Beta Team" });

        return { organization, department, matched };
    }

    public async lookupSearchScenario(): Fixtures.Team.LookupSearchScenario.Result {
        const organization = await this.createOrganization();
        const department = await this.createDepartment({ organization });
        const externalDepartment = await this.createDepartment({ organization });
        const exact = await this.createTeam({ department, name: "Alpha Platform" });

        await this.createTeam({ department, name: "Platform Alpha" });
        await this.createTeam({ department: externalDepartment, name: "Alpha Platform" });

        return {
            expectedNames: ["Alpha Platform", "Platform Alpha"],
            term: "Alpha Platform",
            organization,
            department,
            exact,
        };
    }
}
