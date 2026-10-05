import { PositionService } from "~context/domain/services/position.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class PositionUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Position.Contract {
    public service(props: Unit.Domain.Position.Service.Props = {}): Unit.Domain.Position.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new PositionService(
                this.contract<Repositories.Department.Contract>(repositories.departments),
                this.contract<Repositories.Team.Contract>(repositories.teams),
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
