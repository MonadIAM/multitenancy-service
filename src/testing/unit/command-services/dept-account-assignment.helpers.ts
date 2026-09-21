import { jest } from "@jest/globals";

import { DeptAccountAssignmentCommands } from "~context/application/commands/dept-account-assignment.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class DeptAccountAssignmentCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Application.DeptAccountAssignmentCommands.Contract
{
    public commands(): Unit.Application.DeptAccountAssignmentCommands.Commands.Result {
        const execution = this.execution();

        const assignmentService = {
            restore: jest.fn<Services.DeptAccountAssignment.CommandContract["restore"]>(),
            create: jest.fn<Services.DeptAccountAssignment.CommandContract["create"]>(),
            revoke: jest.fn<Services.DeptAccountAssignment.CommandContract["revoke"]>(),
            purge: jest.fn<Services.DeptAccountAssignment.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            assignmentService,
            commands: new DeptAccountAssignmentCommands(
                execution.transactional,
                this.contract<Services.DeptAccountAssignment.CommandContract>(assignmentService),
            ),
        };
    }
}
