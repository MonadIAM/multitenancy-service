import { MembershipService } from "~context/domain/services/membership.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class MembershipUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Membership.Contract {
    public service(props: Unit.Domain.Membership.Service.Props = {}): Unit.Domain.Membership.Service.Result {
        const repositories = this.repositories(props);
        const services = this.services();
        return {
            service: new MembershipService(
                this.contract<Repositories.Project.Contract>(repositories.projects),
                this.contract<Services.ProjectAccountAssignment.InternalContract>(services.projectAssignments),
                this.contract<Repositories.Membership.Contract>(repositories.memberships),
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
            ),
            transaction: this.transaction(),
            repositories,
            services,
        };
    }
}
