import { jest } from "@jest/globals";

import { InviteQueries } from "~context/application/queries/invite.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class InviteQueriesUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Queries.Invite.Contract {
    public queries(): Unit.Queries.Invite.Queries.Result {
        const inviteRepository = {
            findUniqueOrThrow: jest.fn<Repositories.Invite.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.Invite.QueryContract["findMany"]>(),
        };

        return {
            inviteRepository,
            queries: new InviteQueries(this.contract<Repositories.Invite.QueryContract>(inviteRepository)),
        };
    }
}
