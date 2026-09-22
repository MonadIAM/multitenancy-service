import { jest } from "@jest/globals";

import { TeamAccountAssignmentCommands } from "~context/application/commands/team-account-assignment.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class TeamAccountAssignmentCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Commands.TeamAccountAssignment.Contract
{
    public commands(): Unit.Commands.TeamAccountAssignment.Commands.Result {
        const execution = this.execution();

        const assignmentService = {
            restore: jest.fn<Services.TeamAccountAssignment.CommandContract["restore"]>(),
            create: jest.fn<Services.TeamAccountAssignment.CommandContract["create"]>(),
            revoke: jest.fn<Services.TeamAccountAssignment.CommandContract["revoke"]>(),
            purge: jest.fn<Services.TeamAccountAssignment.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            assignmentService,
            commands: new TeamAccountAssignmentCommands(
                execution.transactional,
                this.contract<Services.TeamAccountAssignment.CommandContract>(assignmentService),
            ),
        };
    }
}
