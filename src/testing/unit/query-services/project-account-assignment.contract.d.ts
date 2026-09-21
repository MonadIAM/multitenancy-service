import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace ProjectAccountAssignmentQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.ProjectAccountAssignment.Contract;
                        readonly projectAccountAssignmentRepository: {
                            readonly findMany: jest.Mock<Repositories.ProjectAccountAssignment.QueryContract["findMany"]>;
                            readonly findUniqueOrThrow: jest.Mock<
                                Repositories.ProjectAccountAssignment.QueryContract["findUniqueOrThrow"]
                            >;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
