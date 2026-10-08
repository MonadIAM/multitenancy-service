import { ProjectAccountAssignmentRepository } from "~context/infrastructure/repositories/project-account-assignment.repository";
import { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";
import { MembershipRepository } from "~context/infrastructure/repositories/membership.repository";
import { ProjectRepository } from "~context/infrastructure/repositories/project.repository";

export class ProjectAccountAssignmentIntegrationHelpers implements Integration.Domain.ProjectAccountAssignment.Contract {
    public service(
        context: Integration.Postgres.Suite.FactoryContext,
    ): Integration.Domain.ProjectAccountAssignment.Service.Context {
        return {
            assignmentService: new ProjectAccountAssignmentService(
                new ProjectAccountAssignmentRepository(context.readManager),
                new MembershipRepository(context.readManager),
                new ProjectRepository(context.readManager),
            ),
        };
    }
}
