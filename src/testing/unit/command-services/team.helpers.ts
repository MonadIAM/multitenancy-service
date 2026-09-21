import { jest } from "@jest/globals";

import { TeamCommands } from "~context/application/commands/team.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class TeamCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Application.TeamCommands.Contract
{
    public commands(): Unit.Application.TeamCommands.Commands.Result {
        const execution = this.execution();

        const teamService = {
            changeLead: jest.fn<Services.Team.CommandContract["changeLead"]>(),
            archive: jest.fn<Services.Team.CommandContract["archive"]>(),
            restore: jest.fn<Services.Team.CommandContract["restore"]>(),
            create: jest.fn<Services.Team.CommandContract["create"]>(),
            update: jest.fn<Services.Team.CommandContract["update"]>(),
            purge: jest.fn<Services.Team.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            teamService,
            commands: new TeamCommands(execution.transactional, this.contract<Services.Team.CommandContract>(teamService)),
        };
    }
}
