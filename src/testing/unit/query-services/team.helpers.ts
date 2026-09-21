import { jest } from "@jest/globals";

import { TeamQueries } from "~context/application/queries/team.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class TeamQueriesUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Application.TeamQueries.Contract {
    public queries(): Unit.Application.TeamQueries.Queries.Result {
        const teamRepository = {
            findUniqueOrThrow: jest.fn<Repositories.Team.QueryContract["findUniqueOrThrow"]>(),
            getLookupList: jest.fn<Repositories.Team.QueryContract["getLookupList"]>(),
            findMany: jest.fn<Repositories.Team.QueryContract["findMany"]>(),
        };

        return {
            teamRepository,
            queries: new TeamQueries(this.contract<Repositories.Team.QueryContract>(teamRepository)),
        };
    }
}
