declare namespace Unit.Queries.Membership {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Membership.Contract;
            membershipRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.Membership.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.Membership.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
