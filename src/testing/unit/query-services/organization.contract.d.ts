import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace OrganizationQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.Organization.Contract;
                        readonly organizationRepository: {
                            readonly getLookupList: jest.Mock<Repositories.Organization.QueryContract["getLookupList"]>;
                            readonly findMany: jest.Mock<Repositories.Organization.QueryContract["findMany"]>;
                            readonly findUniqueOrThrow: jest.Mock<
                                Repositories.Organization.QueryContract["findUniqueOrThrow"]
                            >;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
