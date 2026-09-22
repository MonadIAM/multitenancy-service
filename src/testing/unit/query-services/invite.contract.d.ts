declare namespace Unit.Queries.Invite {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.Invite.Contract;
            inviteRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.Invite.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.Invite.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
