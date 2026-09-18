import { Inject, Injectable, Scope } from "@nestjs/common";

import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { PROJECT_SERVICE } from "~context/domain/services";
import { ActionType, EntityType } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class ProjectCommands implements Commands.Project.Contract {
    private readonly dictionaryPath = "commands.project";
    private readonly resource = "Project";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(PROJECT_SERVICE)
        private readonly projectService: Services.Project.CommandContract,
    ) {}

    public async create(props: Commands.Project.Create.Props): Commands.Project.Create.Result {
        const { input } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CREATE,
                entityType: EntityType.PROJECT,
                realm: input.realm,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.projectService.create({ input, transaction });
            },
        });

        return { message: `${this.dictionaryPath}.CREATED` };
    }

    public async update(props: Commands.Project.Update.Props): Commands.Project.Update.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.projectService.update({ patch: input.patch, transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.UPDATED` };
    }

    public async assignManager(props: Commands.Project.AssignManager.Props): Commands.Project.AssignManager.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.projectService.assignManager({
                    assignment: input.assignment,
                    transaction,
                    realm,
                    id,
                });
            },
        });

        return { message: `${this.dictionaryPath}.MANAGER_ASSIGNED` };
    }

    public async unassignManager(props: Commands.Project.UnassignManager.Props): Commands.Project.UnassignManager.Result {
        const { realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.projectService.unassignManager({ transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.MANAGER_UNASSIGNED` };
    }

    public async archive(props: Commands.Project.Archive.Props): Commands.Project.Archive.Result {
        const { input, realm } = props;

        const projects = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.ARCHIVE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.projectService.archive({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (projects.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_ARCHIVED_COUNT`, params: { count: projects.length } };
        } else {
            return { message: `${this.dictionaryPath}.ARCHIVED` };
        }
    }

    public async restore(props: Commands.Project.Restore.Props): Commands.Project.Restore.Result {
        const { input, realm } = props;

        const projects = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.RESTORE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.projectService.restore({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (projects.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESTORED_COUNT`, params: { count: projects.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESTORED` };
        }
    }

    public async purge(props: Commands.Project.Purge.Props): Commands.Project.Purge.Result {
        const { input, realm } = props;

        const projects = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.DELETE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.projectService.purge({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (projects.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: projects.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
