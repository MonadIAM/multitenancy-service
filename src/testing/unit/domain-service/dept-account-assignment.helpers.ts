import { DeptAccountAssignmentService } from "~context/domain/services/dept-account-assignment.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class DeptAccountAssignmentUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Domain.DeptAccountAssignment.Contract
{
    public service(
        props: Unit.Domain.DeptAccountAssignment.Service.Props = {},
    ): Unit.Domain.DeptAccountAssignment.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new DeptAccountAssignmentService(
                this.contract<Repositories.DeptAccountAssignment.Contract>(repositories.departmentAssignments),
                this.contract<Repositories.OrgMembership.Contract>(repositories.memberships),
                this.contract<Repositories.Department.Contract>(repositories.departments),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
