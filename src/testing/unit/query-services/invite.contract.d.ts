import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace InviteQueries {
                interface Contract extends Domain.Core.Contract {
                    readonly queries: Queries.Signature;
                }

                namespace Queries {
                    type Result = {
                        readonly queries: globalThis.Queries.Invite.Contract;
                        readonly inviteRepository: {
                            readonly findUniqueOrThrow: jest.Mock<Repositories.Invite.QueryContract["findUniqueOrThrow"]>;
                            readonly findMany: jest.Mock<Repositories.Invite.QueryContract["findMany"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
