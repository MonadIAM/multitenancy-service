import { jest } from "@jest/globals";

import { OrganizationQueries } from "~context/application/queries/organization.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class OrganizationQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Queries.Organization.Contract
{
    public queries(): Unit.Queries.Organization.Queries.Result {
        const organizationRepository = {
            findUniqueOrThrow: jest.fn<Repositories.Organization.QueryContract["findUniqueOrThrow"]>(),
            getLookupList: jest.fn<Repositories.Organization.QueryContract["getLookupList"]>(),
            findMany: jest.fn<Repositories.Organization.QueryContract["findMany"]>(),
        };

        return {
            organizationRepository,
            queries: new OrganizationQueries(
                this.contract<Repositories.Organization.QueryContract>(organizationRepository),
            ),
        };
    }
}
