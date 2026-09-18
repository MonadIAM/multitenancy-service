import { TeamAccountAssignmentRepository } from "~context/infrastructure/repositories/team-account-assignment.repository";
import { DepartmentRepository } from "~context/infrastructure/repositories/department.repository";
import { TeamRepository } from "~context/infrastructure/repositories/team.repository";
import { TeamService } from "~context/domain/services/team.service";

export class TeamIntegrationHelpers implements Integration.Domain.Team.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Team.Service.Context {
        return {
            teamService: new TeamService(
                new TeamAccountAssignmentRepository(context.readManager),
                new DepartmentRepository(context.readManager),
                new TeamRepository(context.readManager),
            ),
        };
    }
}
