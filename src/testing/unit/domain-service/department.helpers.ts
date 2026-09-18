import { DepartmentService } from "~context/domain/services/department.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class DepartmentUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Department.Contract {
    public service(props: Unit.Domain.Department.Service.Props = {}): Unit.Domain.Department.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new DepartmentService(
                this.contract<Repositories.DeptAccountAssignment.Contract>(repositories.departmentAssignments),
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
                this.contract<Repositories.Department.Contract>(repositories.departments),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
