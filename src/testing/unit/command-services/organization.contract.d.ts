import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace OrganizationCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.Organization.Contract;
                        readonly organizationService: {
                            readonly confirmBootstrap: jest.Mock<Services.Organization.CommandContract["confirmBootstrap"]>;
                            readonly rejectBootstrap: jest.Mock<Services.Organization.CommandContract["rejectBootstrap"]>;
                            readonly confirmTransfer: jest.Mock<Services.Organization.CommandContract["confirmTransfer"]>;
                            readonly rejectTransfer: jest.Mock<Services.Organization.CommandContract["rejectTransfer"]>;
                            readonly restore: jest.Mock<Services.Organization.CommandContract["restore"]>;
                            readonly create: jest.Mock<Services.Organization.CommandContract["create"]>;
                            readonly update: jest.Mock<Services.Organization.CommandContract["update"]>;
                            readonly revoke: jest.Mock<Services.Organization.CommandContract["revoke"]>;
                            readonly purge: jest.Mock<Services.Organization.CommandContract["purge"]>;
                            readonly transferOwnership: jest.Mock<
                                Services.Organization.CommandContract["transferOwnership"]
                            >;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
