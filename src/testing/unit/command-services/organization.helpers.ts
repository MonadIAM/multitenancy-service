import { jest } from "@jest/globals";

import { OrganizationCommands } from "~context/application/commands/organization.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class OrganizationCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Application.OrganizationCommands.Contract
{
    public commands(): Unit.Application.OrganizationCommands.Commands.Result {
        const execution = this.execution();

        const organizationService = {
            transferOwnership: jest.fn<Services.Organization.CommandContract["transferOwnership"]>(),
            confirmBootstrap: jest.fn<Services.Organization.CommandContract["confirmBootstrap"]>(),
            rejectBootstrap: jest.fn<Services.Organization.CommandContract["rejectBootstrap"]>(),
            confirmTransfer: jest.fn<Services.Organization.CommandContract["confirmTransfer"]>(),
            rejectTransfer: jest.fn<Services.Organization.CommandContract["rejectTransfer"]>(),
            restore: jest.fn<Services.Organization.CommandContract["restore"]>(),
            create: jest.fn<Services.Organization.CommandContract["create"]>(),
            update: jest.fn<Services.Organization.CommandContract["update"]>(),
            revoke: jest.fn<Services.Organization.CommandContract["revoke"]>(),
            purge: jest.fn<Services.Organization.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            organizationService,
            commands: new OrganizationCommands(
                execution.transactional,
                this.contract<Services.Organization.CommandContract>(organizationService),
            ),
        };
    }
}
