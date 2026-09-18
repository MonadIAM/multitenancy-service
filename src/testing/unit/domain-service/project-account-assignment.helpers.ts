import { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class ProjectAccountAssignmentUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Domain.ProjectAccountAssignment.Contract
{
    public service(
        props: Unit.Domain.ProjectAccountAssignment.Service.Props = {},
    ): Unit.Domain.ProjectAccountAssignment.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new ProjectAccountAssignmentService(
                this.contract<Repositories.ProjectAccountAssignment.Contract>(repositories.projectAssignments),
                this.contract<Repositories.OrgMembership.Contract>(repositories.memberships),
                this.contract<Repositories.Project.Contract>(repositories.projects),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
