import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace AccountCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.Account.Contract;
                        readonly accountService: {
                            readonly purge: jest.Mock<Services.Account.ConsumerContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
