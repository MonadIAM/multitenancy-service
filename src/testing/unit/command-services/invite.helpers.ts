import { jest } from "@jest/globals";

import { InviteCommands } from "~context/application/commands/invite.commands";

import { ApplicationCommandUnitHelpers } from "./core.helpers";

export class InviteCommandsUnitHelpers extends ApplicationCommandUnitHelpers implements Unit.Commands.Invite.Contract {
    public commands(): Unit.Commands.Invite.Commands.Result {
        const execution = this.execution();

        const inviteRepository = {
            findExpiredPending: jest.fn<Repositories.Invite.Contract["findExpiredPending"]>(),
        };
        const inviteService = {
            confirmJoin: jest.fn<Services.Invite.CommandContract["confirmJoin"]>(),
            invalidate: jest.fn<Services.Invite.CommandContract["invalidate"]>(),
            rejectJoin: jest.fn<Services.Invite.CommandContract["rejectJoin"]>(),
            decline: jest.fn<Services.Invite.CommandContract["decline"]>(),
            create: jest.fn<Services.Invite.CommandContract["create"]>(),
            accept: jest.fn<Services.Invite.CommandContract["accept"]>(),
            cancel: jest.fn<Services.Invite.CommandContract["cancel"]>(),
            expire: jest.fn<Services.Invite.CommandContract["expire"]>(),
        };

        return {
            ...execution,
            inviteRepository,
            inviteService,
            commands: new InviteCommands(
                execution.transactional,
                this.contract<Repositories.Invite.Contract>(inviteRepository),
                this.contract<Services.Invite.CommandContract>(inviteService),
            ),
        };
    }
}
