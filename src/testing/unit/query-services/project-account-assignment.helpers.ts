import { jest } from "@jest/globals";

import { ProjectAccountAssignmentQueries } from "~context/application/queries/project-account-assignment.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class ProjectAccountAssignmentQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Application.ProjectAccountAssignmentQueries.Contract
{
    public queries(): Unit.Application.ProjectAccountAssignmentQueries.Queries.Result {
        const projectAccountAssignmentRepository = {
            findUniqueOrThrow: jest.fn<Repositories.ProjectAccountAssignment.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.ProjectAccountAssignment.QueryContract["findMany"]>(),
        };

        return {
            projectAccountAssignmentRepository,
            queries: new ProjectAccountAssignmentQueries(
                this.contract<Repositories.ProjectAccountAssignment.QueryContract>(projectAccountAssignmentRepository),
            ),
        };
    }
}
