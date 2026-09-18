import { DeptAccountAssignmentRepository } from "~context/infrastructure/repositories/dept-account-assignment.repository";
import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { DeptAccountAssignmentService } from "~context/domain/services/dept-account-assignment.service";
import { DepartmentRepository } from "~context/infrastructure/repositories/department.repository";

export class DeptAccountAssignmentIntegrationHelpers implements Integration.Domain.DeptAccountAssignment.Contract {
    public service(
        context: Integration.Postgres.Suite.FactoryContext,
    ): Integration.Domain.DeptAccountAssignment.Service.Context {
        return {
            assignmentService: new DeptAccountAssignmentService(
                new DeptAccountAssignmentRepository(context.readManager),
                new OrgMembershipRepository(context.readManager),
                new DepartmentRepository(context.readManager),
            ),
        };
    }
}
