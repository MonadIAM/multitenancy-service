import { jest } from "@jest/globals";

import { ProjectAccountAssignmentQueries } from "~context/application/queries/project-account-assignment.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class ProjectAccountAssignmentQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Queries.ProjectAccountAssignment.Contract
{
    public queries(): Unit.Queries.ProjectAccountAssignment.Queries.Result {
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
