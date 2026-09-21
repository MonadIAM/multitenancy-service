import { jest } from "@jest/globals";

import { ProjectAccountAssignmentCommands } from "~context/application/commands/project-account-assignment.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class ProjectAccountAssignmentCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Application.ProjectAccountAssignmentCommands.Contract
{
    public commands(): Unit.Application.ProjectAccountAssignmentCommands.Commands.Result {
        const execution = this.execution();

        const assignmentService = {
            restore: jest.fn<Services.ProjectAccountAssignment.CommandContract["restore"]>(),
            create: jest.fn<Services.ProjectAccountAssignment.CommandContract["create"]>(),
            revoke: jest.fn<Services.ProjectAccountAssignment.CommandContract["revoke"]>(),
            purge: jest.fn<Services.ProjectAccountAssignment.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            assignmentService,
            commands: new ProjectAccountAssignmentCommands(
                execution.transactional,
                this.contract<Services.ProjectAccountAssignment.CommandContract>(assignmentService),
            ),
        };
    }
}
