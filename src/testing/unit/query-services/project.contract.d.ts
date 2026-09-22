declare namespace Unit.Queries.Project {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Project.Contract;
            projectRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.Project.QueryContract["findUniqueOrThrow"]>;
                getLookupList: Jest.Mock<Repositories.Project.QueryContract["getLookupList"]>;
                findMany: Jest.Mock<Repositories.Project.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
