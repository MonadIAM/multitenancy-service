declare namespace Unit.Queries.DeptAccountAssignment {
    interface Contract extends Domain.Core.Contract {
        queries: Queries.Signature;
    }

    namespace Queries {
        type Result = {
            queries: globalThis.Queries.DeptAccountAssignment.Contract;
            deptAccountAssignmentRepository: {
                findUniqueOrThrow: Jest.Mock<Repositories.DeptAccountAssignment.QueryContract["findUniqueOrThrow"]>;
                findMany: Jest.Mock<Repositories.DeptAccountAssignment.QueryContract["findMany"]>;
            };
        };

        type Signature = () => Result;
    }
}
