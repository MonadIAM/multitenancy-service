import { OrganizationService } from "~context/domain/services/organization.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class OrganizationUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Organization.Contract {
    public service(props: Unit.Domain.Organization.Service.Props = {}): Unit.Domain.Organization.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new OrganizationService(
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
                this.contract<Repositories.OrgMembership.Contract>(repositories.memberships),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
