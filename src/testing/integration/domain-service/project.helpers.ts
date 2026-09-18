import { ProjectAccountAssignmentRepository } from "~context/infrastructure/repositories/project-account-assignment.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { ProjectRepository } from "~context/infrastructure/repositories/project.repository";
import { ProjectService } from "~context/domain/services/project.service";

export class ProjectIntegrationHelpers implements Integration.Domain.Project.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Project.Service.Context {
        return {
            projectService: new ProjectService(
                new ProjectAccountAssignmentRepository(context.readManager),
                new OrganizationRepository(context.readManager),
                new ProjectRepository(context.readManager),
            ),
        };
    }
}
