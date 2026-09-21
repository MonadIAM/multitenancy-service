import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace DepartmentQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.Department.Contract;
                        readonly departmentRepository: {
                            readonly findUniqueOrThrow: jest.Mock<
                                Repositories.Department.QueryContract["findUniqueOrThrow"]
                            >;
                            readonly findMany: jest.Mock<Repositories.Department.QueryContract["findMany"]>;
                            readonly getLookupList: jest.Mock<Repositories.Department.QueryContract["getLookupList"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
