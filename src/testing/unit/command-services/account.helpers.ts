import { jest } from "@jest/globals";

import { AccountCommands } from "~context/application/commands/account.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class AccountCommandsUnitHelpers
    extends ApplicationCommandUnitHelpers
    implements Unit.Application.AccountCommands.Contract
{
    public commands(): Unit.Application.AccountCommands.Commands.Result {
        const execution = this.execution();

        const accountService = {
            purge: jest.fn<Services.Account.ConsumerContract["purge"]>(),
        };

        return {
            ...execution,
            accountService,
            commands: new AccountCommands(
                execution.transactional,
                this.contract<Services.Account.ConsumerContract>(accountService),
            ),
        };
    }
}
