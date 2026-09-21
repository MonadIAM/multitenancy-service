import { jest } from "@jest/globals";

import { DepartmentQueries } from "~context/application/queries/department.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class DepartmentQueriesUnitHelpers
    extends DomainServiceCoreUnitHelpers
    implements Unit.Application.DepartmentQueries.Contract
{
    public queries(): Unit.Application.DepartmentQueries.Queries.Result {
        const departmentRepository = {
            findUniqueOrThrow: jest.fn<Repositories.Department.QueryContract["findUniqueOrThrow"]>(),
            findMany: jest.fn<Repositories.Department.QueryContract["findMany"]>(),
            getLookupList: jest.fn<Repositories.Department.QueryContract["getLookupList"]>(),
        };

        return {
            departmentRepository,
            queries: new DepartmentQueries(this.contract<Repositories.Department.QueryContract>(departmentRepository)),
        };
    }
}
