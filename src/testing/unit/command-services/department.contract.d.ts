import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace DepartmentCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.Department.Contract;
                        readonly departmentService: {
                            readonly changeManager: jest.Mock<Services.Department.CommandContract["changeManager"]>;
                            readonly archive: jest.Mock<Services.Department.CommandContract["archive"]>;
                            readonly restore: jest.Mock<Services.Department.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.Department.CommandContract["create"]>;
                            readonly update: jest.Mock<Services.Department.CommandContract["update"]>;
                            readonly purge: jest.Mock<Services.Department.CommandContract["purge"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
