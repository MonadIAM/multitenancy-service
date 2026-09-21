import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace TeamCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.Team.Contract;
                        readonly teamService: {
                            readonly changeLead: jest.Mock<Services.Team.CommandContract["changeLead"]>;
                            readonly archive: jest.Mock<Services.Team.CommandContract["archive"]>;
                            readonly restore: jest.Mock<Services.Team.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.Team.CommandContract["create"]>;
                            readonly update: jest.Mock<Services.Team.CommandContract["update"]>;
                            readonly purge: jest.Mock<Services.Team.CommandContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
