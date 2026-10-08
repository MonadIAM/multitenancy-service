import { jest } from "@jest/globals";

import { OrganizationService } from "~context/domain/services/organization.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class OrganizationUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Organization.Contract {
    public service(props: Unit.Domain.Organization.Service.Props = {}): Unit.Domain.Organization.Service.Result {
        const repositories = this.repositories(props);
        const hasPendingProcesses = jest.fn<Repositories.Organization.HasPendingProcesses.Signature>();
        hasPendingProcesses.mockResolvedValue(false);
        return {
            service: new OrganizationService(
                this.contract<Repositories.Project.Contract>(repositories.projects),
                this.contract<Repositories.Organization.Contract>({
                    ...repositories.organizations,
                    hasPendingProcesses,
                }),
                this.contract<Repositories.Membership.Contract>(repositories.memberships),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
            hasPendingProcesses,
        };
    }
}
