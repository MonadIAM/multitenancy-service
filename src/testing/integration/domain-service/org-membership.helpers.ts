import { ProjectAccountAssignmentRepository } from "~context/infrastructure/repositories/project-account-assignment.repository";
import { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";
import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { ProjectRepository } from "~context/infrastructure/repositories/project.repository";
import { OrgMembershipService } from "~context/domain/services/org-membership.service";

export class OrgMembershipIntegrationHelpers implements Integration.Domain.OrgMembership.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.OrgMembership.Service.Context {
        const memberships = new OrgMembershipRepository(context.readManager);
        const projectAssignments = new ProjectAccountAssignmentService(
            new ProjectAccountAssignmentRepository(context.readManager),
            memberships,
            new ProjectRepository(context.readManager),
        );

        return {
            membershipService: new OrgMembershipService(
                new ProjectRepository(context.readManager),
                projectAssignments,
                memberships,
                new OrganizationRepository(context.readManager),
            ),
        };
    }
}
