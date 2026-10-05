import { TeamService } from "~context/domain/services/team.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class TeamUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Team.Contract {
    public service(props: Unit.Domain.Team.Service.Props = {}): Unit.Domain.Team.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new TeamService(
                this.contract<Repositories.Department.Contract>(repositories.departments),
                this.contract<Repositories.Team.Contract>(repositories.teams),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
