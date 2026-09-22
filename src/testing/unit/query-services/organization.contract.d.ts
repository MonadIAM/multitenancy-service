declare namespace Unit.Queries.Organization {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Organization.Contract;
            organizationRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.Organization.QueryContract["findUniqueOrThrow"]>;
                getLookupList: Jest.Mock<Repositories.Organization.QueryContract["getLookupList"]>;
                findMany: Jest.Mock<Repositories.Organization.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
