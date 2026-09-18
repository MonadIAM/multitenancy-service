import { Inject, Injectable, Scope } from "@nestjs/common";

import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { TEAM_SERVICE } from "~context/domain/services";
import { ActionType, EntityType } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class TeamCommands implements Commands.Team.Contract {
    private readonly dictionaryPath = "commands.team";
    private readonly resource = "Team";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(TEAM_SERVICE)
        private readonly teamService: Services.Team.CommandContract,
    ) {}

    public async create(props: Commands.Team.Create.Props): Commands.Team.Create.Result {
        const { input, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CREATE,
                entityType: EntityType.TEAM,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.teamService.create({ input, transaction, realm });
            },
        });

        return { message: `${this.dictionaryPath}.CREATED` };
    }

    public async update(props: Commands.Team.Update.Props): Commands.Team.Update.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.TEAM,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.teamService.update({ patch: input.patch, transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.UPDATED` };
    }

    public async changeLead(props: Commands.Team.ChangeLead.Props): Commands.Team.ChangeLead.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.TEAM,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.teamService.changeLead({ assignment: input.assignment, transaction, realm, id });
            },
        });

        if (input.assignment) {
            return { message: `${this.dictionaryPath}.LEAD_ASSIGNED` };
        } else {
            return { message: `${this.dictionaryPath}.LEAD_UNASSIGNED` };
        }
    }

    public async archive(props: Commands.Team.Archive.Props): Commands.Team.Archive.Result {
        const { input, realm } = props;

        const teams = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.ARCHIVE,
                entityType: EntityType.TEAM,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.teamService.archive({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (teams.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_ARCHIVED_COUNT`, params: { count: teams.length } };
        } else {
            return { message: `${this.dictionaryPath}.ARCHIVED` };
        }
    }

    public async restore(props: Commands.Team.Restore.Props): Commands.Team.Restore.Result {
        const { input, realm } = props;

        const teams = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.RESTORE,
                entityType: EntityType.TEAM,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.teamService.restore({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (teams.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESTORED_COUNT`, params: { count: teams.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESTORED` };
        }
    }

    public async purge(props: Commands.Team.Purge.Props): Commands.Team.Purge.Result {
        const { input, realm } = props;

        const teams = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.DELETE,
                entityType: EntityType.TEAM,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.teamService.purge({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (teams.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: teams.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
