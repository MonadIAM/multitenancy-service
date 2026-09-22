import { jest } from "@jest/globals";

import { ProjectQueries } from "~context/application/queries/project.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class ProjectQueriesUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Queries.Project.Contract {
    public queries(): Unit.Queries.Project.Queries.Result {
        const projectRepository = {
            findUniqueOrThrow: jest.fn<Repositories.Project.QueryContract["findUniqueOrThrow"]>(),
            getLookupList: jest.fn<Repositories.Project.QueryContract["getLookupList"]>(),
            findMany: jest.fn<Repositories.Project.QueryContract["findMany"]>(),
        };

        return {
            projectRepository,
            queries: new ProjectQueries(this.contract<Repositories.Project.QueryContract>(projectRepository)),
        };
    }
}
