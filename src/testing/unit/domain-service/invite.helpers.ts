import { InviteService } from "~context/domain/services/invite.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class InviteUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Invite.Contract {
    public service(props: Unit.Domain.Invite.Service.Props = {}): Unit.Domain.Invite.Service.Result {
        const repositories = this.repositories(props);
        const services = this.services();
        return {
            service: new InviteService(
                this.contract<Services.Membership.CommandContract>(services.memberships),
                this.contract<Repositories.Membership.Contract>(repositories.memberships),
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
                this.contract<Repositories.Invite.Contract>(repositories.invites),
            ),
            transaction: this.transaction(),
            repositories,
            services,
        };
    }
}
