import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace TeamAccountAssignmentCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.TeamAccountAssignment.Contract;
                        readonly assignmentService: {
                            readonly restore: jest.Mock<Services.TeamAccountAssignment.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.TeamAccountAssignment.CommandContract["create"]>;
                            readonly revoke: jest.Mock<Services.TeamAccountAssignment.CommandContract["revoke"]>;
                            readonly purge: jest.Mock<Services.TeamAccountAssignment.CommandContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
