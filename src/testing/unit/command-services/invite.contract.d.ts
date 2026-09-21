import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace InviteCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.Invite.Contract;
                        readonly inviteRepository: {
                            readonly findExpiredPending: jest.Mock<Repositories.Invite.Contract["findExpiredPending"]>;
                        };
                        readonly inviteService: {
                            readonly confirmJoin: jest.Mock<Services.Invite.CommandContract["confirmJoin"]>;
                            readonly invalidate: jest.Mock<Services.Invite.CommandContract["invalidate"]>;
                            readonly rejectJoin: jest.Mock<Services.Invite.CommandContract["rejectJoin"]>;
                            readonly decline: jest.Mock<Services.Invite.CommandContract["decline"]>;
                            readonly create: jest.Mock<Services.Invite.CommandContract["create"]>;
                            readonly accept: jest.Mock<Services.Invite.CommandContract["accept"]>;
                            readonly cancel: jest.Mock<Services.Invite.CommandContract["cancel"]>;
                            readonly expire: jest.Mock<Services.Invite.CommandContract["expire"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
