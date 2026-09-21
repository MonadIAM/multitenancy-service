import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace OrgMembershipQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.OrgMembership.Contract;
                        readonly orgMembershipRepository: {
                            readonly findUniqueOrThrow: jest.Mock<
                                Repositories.OrgMembership.QueryContract["findUniqueOrThrow"]
                            >;
                            readonly findMany: jest.Mock<Repositories.OrgMembership.QueryContract["findMany"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
