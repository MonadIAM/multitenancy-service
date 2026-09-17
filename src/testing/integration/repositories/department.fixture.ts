import { CoreFixture } from "./core.fixture";

export class DepartmentFixture extends CoreFixture implements Fixtures.Department.Contract {
    public async filterScenario(): Fixtures.Department.FilterScenario.Result {
        const organization = await this.createOrganization();
        const matched = await this.createDepartment({ organization, name: "Alpha Department" });

        await this.createDepartment({ organization, name: "Beta Department" });

        return { organization, matched };
    }

    public async lookupSearchScenario(): Fixtures.Department.LookupSearchScenario.Result {
        const organization = await this.createOrganization();
        const external = await this.createOrganization();
        const exact = await this.createDepartment({ organization, name: "Alpha Platform" });

        await this.createDepartment({ organization, name: "Platform Alpha" });
        await this.createDepartment({ organization: external, name: "Alpha Platform" });

        return {
            expectedNames: ["Alpha Platform", "Platform Alpha"],
            term: "Alpha Platform",
            organization,
            exact,
        };
    }
}
