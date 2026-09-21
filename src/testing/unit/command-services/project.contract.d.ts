import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace ProjectCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.Project.Contract;
                        readonly projectService: {
                            readonly confirmBootstrap: jest.Mock<Services.Project.CommandContract["confirmBootstrap"]>;
                            readonly rejectBootstrap: jest.Mock<Services.Project.CommandContract["rejectBootstrap"]>;
                            readonly changeManager: jest.Mock<Services.Project.CommandContract["changeManager"]>;
                            readonly archive: jest.Mock<Services.Project.CommandContract["archive"]>;
                            readonly restore: jest.Mock<Services.Project.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.Project.CommandContract["create"]>;
                            readonly update: jest.Mock<Services.Project.CommandContract["update"]>;
                            readonly purge: jest.Mock<Services.Project.CommandContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
