declare namespace Unit.Queries.Team {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Team.Contract;
            teamRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.Team.QueryContract["findUniqueOrThrow"]>;
                getLookupList: Jest.Mock<Repositories.Team.QueryContract["getLookupList"]>;
                findMany: Jest.Mock<Repositories.Team.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
