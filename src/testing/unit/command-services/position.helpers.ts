import { jest } from "@jest/globals";

import { PositionCommands } from "~context/application/commands/position.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class PositionCommandsUnitHelpers extends ApplicationCommandUnitHelpers implements Unit.Commands.Position.Contract {
    public commands(): Unit.Commands.Position.Commands.Result {
        const execution = this.execution();
        const positionService = {
            validatePlacement: jest.fn<Services.Position.CommandContract["validatePlacement"]>(),
            completeReference: jest.fn<Services.Position.CommandContract["completeReference"]>(),
            release: jest.fn<Services.Position.CommandContract["release"]>(),
        };

        return {
            ...execution,
            positionService,
            commands: new PositionCommands(
                execution.transactional,
                this.contract<Services.Position.CommandContract>(positionService),
            ),
        };
    }
}
