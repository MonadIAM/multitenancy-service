import { jest } from "@jest/globals";

import { MembershipQueries } from "~context/application/queries/membership.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class MembershipQueriesUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Queries.Membership.Contract {
    public queries(): Unit.Queries.Membership.Queries.Result {
        const membershipRepository = {
            findUniqueOrThrow: jest.fn<Repositories.Membership.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.Membership.QueryContract["findMany"]>(),
        };

        return {
            membershipRepository,
            queries: new MembershipQueries(this.contract<Repositories.Membership.QueryContract>(membershipRepository)),
        };
    }
}
