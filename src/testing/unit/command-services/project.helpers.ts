import { jest } from "@jest/globals";

import { ProjectCommands } from "~context/application/commands/project.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class ProjectCommandsUnitHelpers extends ApplicationCommandUnitHelpers implements Unit.Commands.Project.Contract {
    public commands(): Unit.Commands.Project.Commands.Result {
        const execution = this.execution();

        const projectService = {
            confirmBootstrap: jest.fn<Services.Project.CommandContract["confirmBootstrap"]>(),
            rejectBootstrap: jest.fn<Services.Project.CommandContract["rejectBootstrap"]>(),
            changeManager: jest.fn<Services.Project.CommandContract["changeManager"]>(),
            archive: jest.fn<Services.Project.CommandContract["archive"]>(),
            restore: jest.fn<Services.Project.CommandContract["restore"]>(),
            create: jest.fn<Services.Project.CommandContract["create"]>(),
            update: jest.fn<Services.Project.CommandContract["update"]>(),
            purge: jest.fn<Services.Project.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            projectService,
            commands: new ProjectCommands(
                execution.transactional,
                this.contract<Services.Project.CommandContract>(projectService),
            ),
        };
    }
}
