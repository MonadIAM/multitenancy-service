import { TeamAccountAssignmentRepository } from "~context/infrastructure/repositories/team-account-assignment.repository";
import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { TeamAccountAssignmentService } from "~context/domain/services/team-account-assignment.service";
import { TeamRepository } from "~context/infrastructure/repositories/team.repository";

export class TeamAccountAssignmentIntegrationHelpers implements Integration.Domain.TeamAccountAssignment.Contract {
    public service(
        context: Integration.Postgres.Suite.FactoryContext,
    ): Integration.Domain.TeamAccountAssignment.Service.Context {
        return {
            assignmentService: new TeamAccountAssignmentService(
                new TeamAccountAssignmentRepository(context.readManager),
                new OrgMembershipRepository(context.readManager),
                new TeamRepository(context.readManager),
            ),
        };
    }
}
