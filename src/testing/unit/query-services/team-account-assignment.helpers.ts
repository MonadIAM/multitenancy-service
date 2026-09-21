import { jest } from "@jest/globals";

import { TeamAccountAssignmentQueries } from "~context/application/queries/team-account-assignment.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class TeamAccountAssignmentQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Application.TeamAccountAssignmentQueries.Contract
{
    public queries(): Unit.Application.TeamAccountAssignmentQueries.Queries.Result {
        const teamAccountAssignmentRepository = {
            findUniqueOrThrow: jest.fn<Repositories.TeamAccountAssignment.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.TeamAccountAssignment.QueryContract["findMany"]>(),
        };

        return {
            teamAccountAssignmentRepository,
            queries: new TeamAccountAssignmentQueries(
                this.contract<Repositories.TeamAccountAssignment.QueryContract>(teamAccountAssignmentRepository),
            ),
        };
    }
}
