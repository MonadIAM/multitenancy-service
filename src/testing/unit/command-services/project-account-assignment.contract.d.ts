import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace ProjectAccountAssignmentCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.ProjectAccountAssignment.Contract;
                        readonly assignmentService: {
                            readonly restore: jest.Mock<Services.ProjectAccountAssignment.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.ProjectAccountAssignment.CommandContract["create"]>;
                            readonly revoke: jest.Mock<Services.ProjectAccountAssignment.CommandContract["revoke"]>;
                            readonly purge: jest.Mock<Services.ProjectAccountAssignment.CommandContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
