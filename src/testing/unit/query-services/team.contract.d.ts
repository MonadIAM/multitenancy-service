import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace TeamQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.Team.Contract;
                        readonly teamRepository: {
                            readonly findUniqueOrThrow: jest.Mock<Repositories.Team.QueryContract["findUniqueOrThrow"]>;
                            readonly getLookupList: jest.Mock<Repositories.Team.QueryContract["getLookupList"]>;
                            readonly findMany: jest.Mock<Repositories.Team.QueryContract["findMany"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
