declare namespace Unit.Queries.Department {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Department.Contract;
            departmentRepository: {
                getHierarchyGraph: Jest.Mock<Repositories.Department.QueryContract["getHierarchyGraph"]>;
                findUniqueOrThrow: Jest.Mock<Repositories.Department.QueryContract["findUniqueOrThrow"]>;
                findDescendants: Jest.Mock<Repositories.Department.QueryContract["findDescendants"]>;
                findAncestors: Jest.Mock<Repositories.Department.QueryContract["findAncestors"]>;
                getLookupList: Jest.Mock<Repositories.Department.QueryContract["getLookupList"]>;
                findMany: Jest.Mock<Repositories.Department.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
