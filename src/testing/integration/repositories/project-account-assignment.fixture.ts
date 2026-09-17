import { CoreFixture } from "./core.fixture";

export class ProjectAccountAssignmentFixture extends CoreFixture implements Fixtures.ProjectAccountAssignment.Contract {
    public async filterScenario(): Fixtures.ProjectAccountAssignment.FilterScenario.Result {
        const organization = await this.createOrganization();
        const membership = await this.createOrgMembership({ organization });
        const project = await this.createProject({ organization });
        const matched = await this.createProjectAccountAssignment({ membership, project });
        const anotherProject = await this.createProject({ organization });

        await this.createProjectAccountAssignment({ membership, project: anotherProject });

        return { membership, project, matched };
    }
}
