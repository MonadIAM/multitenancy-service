import { CoreFixture } from "./core.fixture";

export class TeamAccountAssignmentFixture extends CoreFixture implements Fixtures.TeamAccountAssignment.Contract {
    public async filterScenario(): Fixtures.TeamAccountAssignment.FilterScenario.Result {
        const organization = await this.createOrganization();
        const membership = await this.createOrgMembership({ organization });
        const department = await this.createDepartment({ organization });
        const team = await this.createTeam({ department });
        const matched = await this.createTeamAccountAssignment({ membership, team });
        const anotherTeam = await this.createTeam({ department });

        await this.createTeamAccountAssignment({ membership, team: anotherTeam });

        return { membership, matched, team };
    }
}
