import { ProjectAccountAssignmentRepository } from "~context/infrastructure/repositories/project-account-assignment.repository";
import { DeptAccountAssignmentRepository } from "~context/infrastructure/repositories/dept-account-assignment.repository";
import { TeamAccountAssignmentRepository } from "~context/infrastructure/repositories/team-account-assignment.repository";
import { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";
import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { DeptAccountAssignmentService } from "~context/domain/services/dept-account-assignment.service";
import { TeamAccountAssignmentService } from "~context/domain/services/team-account-assignment.service";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { DepartmentRepository } from "~context/infrastructure/repositories/department.repository";
import { ProjectRepository } from "~context/infrastructure/repositories/project.repository";
import { OrgMembershipService } from "~context/domain/services/org-membership.service";
import { TeamRepository } from "~context/infrastructure/repositories/team.repository";

export class OrgMembershipIntegrationHelpers implements Integration.Domain.OrgMembership.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.OrgMembership.Service.Context {
        const memberships = new OrgMembershipRepository(context.readManager);
        const projectAssignments = new ProjectAccountAssignmentService(
            new ProjectAccountAssignmentRepository(context.readManager),
            memberships,
            new ProjectRepository(context.readManager),
        );
        const departmentAssignments = new DeptAccountAssignmentService(
            new DeptAccountAssignmentRepository(context.readManager),
            memberships,
            new DepartmentRepository(context.readManager),
        );
        const teamAssignments = new TeamAccountAssignmentService(
            new TeamAccountAssignmentRepository(context.readManager),
            memberships,
            new TeamRepository(context.readManager),
        );
        return {
            membershipService: new OrgMembershipService(
                projectAssignments,
                departmentAssignments,
                teamAssignments,
                memberships,
                new OrganizationRepository(context.readManager),
            ),
        };
    }
}
