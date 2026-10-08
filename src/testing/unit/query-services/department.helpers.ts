import { jest } from "@jest/globals";

import { DepartmentQueries } from "~context/application/queries/department.queries";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class DepartmentQueriesUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Queries.Department.Contract {
    public queries(): Unit.Queries.Department.Queries.Result {
        const departmentRepository = {
            getHierarchyGraph: jest.fn<Repositories.Department.QueryContract["getHierarchyGraph"]>(),
            findUniqueOrThrow: jest.fn<Repositories.Department.QueryContract["findUniqueOrThrow"]>(),
            findDescendants: jest.fn<Repositories.Department.QueryContract["findDescendants"]>(),
            findAncestors: jest.fn<Repositories.Department.QueryContract["findAncestors"]>(),
            getLookupList: jest.fn<Repositories.Department.QueryContract["getLookupList"]>(),
            findMany: jest.fn<Repositories.Department.QueryContract["findMany"]>(),
        };

        return {
            departmentRepository,
            queries: new DepartmentQueries(this.contract<Repositories.Department.QueryContract>(departmentRepository)),
        };
    }
}
