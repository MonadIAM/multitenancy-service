import { jest } from "@jest/globals";

import { OrgMembershipQueries } from "~context/application/queries/org-membership.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class OrgMembershipQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Queries.OrgMembership.Contract
{
    public queries(): Unit.Queries.OrgMembership.Queries.Result {
        const orgMembershipRepository = {
            findUniqueOrThrow: jest.fn<Repositories.OrgMembership.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.OrgMembership.QueryContract["findMany"]>(),
        };

        return {
            orgMembershipRepository,
            queries: new OrgMembershipQueries(
                this.contract<Repositories.OrgMembership.QueryContract>(orgMembershipRepository),
            ),
        };
    }
}
