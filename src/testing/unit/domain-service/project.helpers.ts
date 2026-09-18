import { ProjectService } from "~context/domain/services/project.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class ProjectUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Project.Contract {
    public service(props: Unit.Domain.Project.Service.Props = {}): Unit.Domain.Project.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new ProjectService(
                this.contract<Repositories.ProjectAccountAssignment.Contract>(repositories.projectAssignments),
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
                this.contract<Repositories.Project.Contract>(repositories.projects),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
