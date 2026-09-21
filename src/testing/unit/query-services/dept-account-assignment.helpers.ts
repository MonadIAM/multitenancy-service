import { jest } from "@jest/globals";

import { DeptAccountAssignmentQueries } from "~context/application/queries/dept-account-assignment.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class DeptAccountAssignmentQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Application.DeptAccountAssignmentQueries.Contract
{
    public queries(): Unit.Application.DeptAccountAssignmentQueries.Queries.Result {
        const deptAccountAssignmentRepository = {
            findUniqueOrThrow: jest.fn<Repositories.DeptAccountAssignment.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.DeptAccountAssignment.QueryContract["findMany"]>(),
        };

        return {
            deptAccountAssignmentRepository,
            queries: new DeptAccountAssignmentQueries(
                this.contract<Repositories.DeptAccountAssignment.QueryContract>(deptAccountAssignmentRepository),
            ),
        };
    }
}
