declare namespace Unit.Queries.OrgMembership {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.OrgMembership.Contract;
            orgMembershipRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.OrgMembership.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.OrgMembership.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
