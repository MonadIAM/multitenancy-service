import { ProjectAccountAssignmentRepository } from "~context/infrastructure/repositories/project-account-assignment.repository";
import { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";
import { MembershipRepository } from "~context/infrastructure/repositories/membership.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { ProjectRepository } from "~context/infrastructure/repositories/project.repository";
import { MembershipService } from "~context/domain/services/membership.service";

export class MembershipIntegrationHelpers implements Integration.Domain.Membership.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Membership.Service.Context {
        const memberships = new MembershipRepository(context.readManager);
        const projectAssignments = new ProjectAccountAssignmentService(
            new ProjectAccountAssignmentRepository(context.readManager),
            memberships,
            new ProjectRepository(context.readManager),
        );

        return {
            membershipService: new MembershipService(
                new ProjectRepository(context.readManager),
                projectAssignments,
                memberships,
                new OrganizationRepository(context.readManager),
            ),
        };
    }
}
