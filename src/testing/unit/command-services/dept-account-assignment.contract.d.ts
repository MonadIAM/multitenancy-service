import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace DeptAccountAssignmentCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.DeptAccountAssignment.Contract;
                        readonly assignmentService: {
                            readonly restore: jest.Mock<Services.DeptAccountAssignment.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.DeptAccountAssignment.CommandContract["create"]>;
                            readonly revoke: jest.Mock<Services.DeptAccountAssignment.CommandContract["revoke"]>;
                            readonly purge: jest.Mock<Services.DeptAccountAssignment.CommandContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
