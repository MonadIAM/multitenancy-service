import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace DeptAccountAssignmentQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.DeptAccountAssignment.Contract;
                        readonly deptAccountAssignmentRepository: {
                            readonly findUniqueOrThrow: jest.Mock<
                                Repositories.DeptAccountAssignment.QueryContract["findUniqueOrThrow"]
                            >;
                            readonly findMany: jest.Mock<Repositories.DeptAccountAssignment.QueryContract["findMany"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
