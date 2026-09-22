declare namespace Unit.Queries.ProjectAccountAssignment {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.ProjectAccountAssignment.Contract;
            projectAccountAssignmentRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.ProjectAccountAssignment.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.ProjectAccountAssignment.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
