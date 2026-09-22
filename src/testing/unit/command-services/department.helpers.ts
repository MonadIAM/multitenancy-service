import { jest } from "@jest/globals";

import { DepartmentCommands } from "~context/application/commands/department.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class DepartmentCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Commands.Department.Contract
{
    public commands(): Unit.Commands.Department.Commands.Result {
        const execution = this.execution();

        const departmentService = {
            changeManager: jest.fn<Services.Department.CommandContract["changeManager"]>(),
            archive: jest.fn<Services.Department.CommandContract["archive"]>(),
            restore: jest.fn<Services.Department.CommandContract["restore"]>(),
            create: jest.fn<Services.Department.CommandContract["create"]>(),
            update: jest.fn<Services.Department.CommandContract["update"]>(),
            purge: jest.fn<Services.Department.CommandContract["purge"]>(),
        };

        return {
            ...execution,
            departmentService,
            commands: new DepartmentCommands(
                execution.transactional,
                this.contract<Services.Department.CommandContract>(departmentService),
            ),
        };
    }
}
