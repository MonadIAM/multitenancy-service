import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace ProjectQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.Project.Contract;
                        readonly projectRepository: {
                            readonly findUniqueOrThrow: jest.Mock<Repositories.Project.QueryContract["findUniqueOrThrow"]>;
                            readonly getLookupList: jest.Mock<Repositories.Project.QueryContract["getLookupList"]>;
                            readonly findMany: jest.Mock<Repositories.Project.QueryContract["findMany"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
