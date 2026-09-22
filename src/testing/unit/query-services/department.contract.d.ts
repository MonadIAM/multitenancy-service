declare namespace Unit.Queries.Department {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Department.Contract;
            departmentRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.Department.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.Department.QueryContract["findMany"]>;
                getLookupList: Jest.Mock<Repositories.Department.QueryContract["getLookupList"]>;
            };
        };

        type Signature = () => Result;
    }
}
