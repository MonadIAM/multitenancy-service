import type { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Application {
            namespace OrgMembershipCommands {
                interface Contract extends CommandCore.Contract {
                    readonly commands: Commands.Signature;
                }

                namespace Commands {
                    type Result = CommandCore.Execution.Result & {
                        readonly commands: globalThis.Commands.OrgMembership.Contract;
                        readonly membershipService: {
                            readonly suspend: jest.Mock<Services.OrgMembership.CommandContract["suspend"]>;
                            readonly resume: jest.Mock<Services.OrgMembership.CommandContract["resume"]>;
                            readonly leave: jest.Mock<Services.OrgMembership.CommandContract["leave"]>;
                            readonly block: jest.Mock<Services.OrgMembership.CommandContract["block"]>;
                            readonly join: jest.Mock<Services.OrgMembership.CommandContract["join"]>;
                        };
                    };

                    type Signature = () => Result;
                }
            }
        }
    }
}
