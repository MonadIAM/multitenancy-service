import { OrgMembershipService } from "~context/domain/services/org-membership.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class OrgMembershipUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.OrgMembership.Contract {
    public service(props: Unit.Domain.OrgMembership.Service.Props = {}): Unit.Domain.OrgMembership.Service.Result {
        const repositories = this.repositories(props);
        const services = this.services();
        return {
            service: new OrgMembershipService(
                this.contract<Repositories.Project.Contract>(repositories.projects),
                this.contract<Services.ProjectAccountAssignment.InternalContract>(services.projectAssignments),
                this.contract<Repositories.OrgMembership.Contract>(repositories.memberships),
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
            ),
            transaction: this.transaction(),
            repositories,
            services,
        };
    }
}
