import { TeamAccountAssignmentService } from "~context/domain/services/team-account-assignment.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class TeamAccountAssignmentUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Domain.TeamAccountAssignment.Contract
{
    public service(
        props: Unit.Domain.TeamAccountAssignment.Service.Props = {},
    ): Unit.Domain.TeamAccountAssignment.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new TeamAccountAssignmentService(
                this.contract<Repositories.TeamAccountAssignment.Contract>(repositories.teamAssignments),
                this.contract<Repositories.OrgMembership.Contract>(repositories.memberships),
                this.contract<Repositories.Team.Contract>(repositories.teams),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
