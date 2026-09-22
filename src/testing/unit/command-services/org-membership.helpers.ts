import { jest } from "@jest/globals";

import { OrgMembershipCommands } from "~context/application/commands/org-membership.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class OrgMembershipCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Commands.OrgMembership.Contract
{
    public commands(): Unit.Commands.OrgMembership.Commands.Result {
        const execution = this.execution();

        const membershipService = {
            suspend: jest.fn<Services.OrgMembership.CommandContract["suspend"]>(),
            resume: jest.fn<Services.OrgMembership.CommandContract["resume"]>(),
            leave: jest.fn<Services.OrgMembership.CommandContract["leave"]>(),
            block: jest.fn<Services.OrgMembership.CommandContract["block"]>(),
            join: jest.fn<Services.OrgMembership.CommandContract["join"]>(),
        };

        return {
            ...execution,
            membershipService,
            commands: new OrgMembershipCommands(
                execution.transactional,
                this.contract<Services.OrgMembership.CommandContract>(membershipService),
            ),
        };
    }
}
