import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace TeamAccountAssignmentQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.TeamAccountAssignment.Contract;
                        readonly teamAccountAssignmentRepository: {
                            readonly findMany: jest.Mock<Repositories.TeamAccountAssignment.QueryContract["findMany"]>;
                            readonly findUniqueOrThrow: jest.Mock<
                                Repositories.TeamAccountAssignment.QueryContract["findUniqueOrThrow"]
                            >;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
