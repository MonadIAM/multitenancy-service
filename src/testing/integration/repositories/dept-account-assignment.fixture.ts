import { CoreFixture } from "./core.fixture";

export class DeptAccountAssignmentFixture extends CoreFixture implements Fixtures.DeptAccountAssignment.Contract {
    public async filterScenario(): Fixtures.DeptAccountAssignment.FilterScenario.Result {
        const organization = await this.createOrganization();
        const membership = await this.createOrgMembership({ organization });
        const department = await this.createDepartment({ organization });
        const matched = await this.createDeptAccountAssignment({ membership, department });
        const anotherDepartment = await this.createDepartment({ organization });

        await this.createDeptAccountAssignment({ membership, department: anotherDepartment });

        return { membership, department, matched };
    }
}
