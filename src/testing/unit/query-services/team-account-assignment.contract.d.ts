declare namespace Unit.Queries.TeamAccountAssignment {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.TeamAccountAssignment.Contract;
            teamAccountAssignmentRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.TeamAccountAssignment.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.TeamAccountAssignment.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
