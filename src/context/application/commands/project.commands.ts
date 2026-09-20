import { Inject, Injectable, Scope } from "@nestjs/common";

import { ActionType, EntityType, RealmTopicAction, KafkaTopic } from "~context/enums";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { PROJECT_SERVICE } from "~context/domain/services";
import { CONSUMER_META } from "~context/constants";

import { ProjectMapper } from "../mappers/project.mapper";

@Injectable({ scope: Scope.DEFAULT })
export class ProjectCommands implements Commands.Project.Contract {
    private readonly mapper: Commands.Mappers.Project.Contract;
    private readonly dictionaryPath = "commands.project";
    private readonly resource = "Project";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(PROJECT_SERVICE)
        private readonly projectService: Services.Project.CommandContract,
    ) {
        this.mapper = new ProjectMapper();
    }

    public async confirmBootstrap(
        props: Commands.Project.ConfirmBootstrap.Props,
    ): Commands.Project.ConfirmBootstrap.Result {
        const { incoming, ...request } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.compensationPayload,
                actionType: RealmTopicAction.SYSTEM_PURGE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.PROJECT,
                actionType: ActionType.CREATE,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.projectService.confirmBootstrap({ ...request, transaction });

                return { ...result, actor: request.actor };
            },
        });
    }

    public async rejectBootstrap(props: Commands.Project.RejectBootstrap.Props): Commands.Project.RejectBootstrap.Result {
        const { incoming, ...request } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            audit: {
                entityType: EntityType.PROJECT,
                actionType: ActionType.CREATE,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: (transaction) => this.projectService.rejectBootstrap({ ...request, transaction }),
        });
    }

    public async create(props: Commands.Project.Create.Props): Commands.Project.Create.Result {
        const { input, actor } = props;

        await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.bootstrapPayload,
                actionType: RealmTopicAction.BOOTSTRAP_PROJECT_REQUESTED,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.PROJECT,
                actionType: ActionType.CREATE,
                realm: input.realm,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const project = await this.projectService.create({ input, transaction });

                return { project, actor };
            },
        });

        return { message: `${this.dictionaryPath}.CREATION_REQUESTED` };
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

    public async changeManager(props: Commands.Project.ChangeManager.Props): Commands.Project.ChangeManager.Result {
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
                return await this.projectService.changeManager({
                    assignment: input.assignment,
                    transaction,
                    realm,
                    id,
                });
            },
        });

        if (input.assignment) {
            return { message: `${this.dictionaryPath}.MANAGER_ASSIGNED` };
        } else {
            return { message: `${this.dictionaryPath}.MANAGER_UNASSIGNED` };
        }
    }

    public async archive(props: Commands.Project.Archive.Props): Commands.Project.Archive.Result {
        const { input, realm, actor } = props;

        const { projects } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.lifecyclePayload,
                destinationTopic: KafkaTopic.REALM,
                actionType: RealmTopicAction.SYSTEM_REVOKE,
            },
            audit: {
                actionType: ActionType.ARCHIVE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const projects = await this.projectService.archive({ identifiers: input.identifiers, transaction, realm });

                return { projects, actor };
            },
        });

        if (projects.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_ARCHIVED_COUNT`, params: { count: projects.length } };
        } else {
            return { message: `${this.dictionaryPath}.ARCHIVED` };
        }
    }

    public async restore(props: Commands.Project.Restore.Props): Commands.Project.Restore.Result {
        const { input, realm, actor } = props;

        const { projects } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.lifecyclePayload,
                destinationTopic: KafkaTopic.REALM,
                actionType: RealmTopicAction.SYSTEM_RESTORE,
            },
            audit: {
                actionType: ActionType.RESTORE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const projects = await this.projectService.restore({ identifiers: input.identifiers, transaction, realm });

                return { projects, actor };
            },
        });

        if (projects.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESTORED_COUNT`, params: { count: projects.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESTORED` };
        }
    }

    public async purge(props: Commands.Project.Purge.Props): Commands.Project.Purge.Result {
        const { input, realm, actor } = props;

        const { projects } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.lifecyclePayload,
                destinationTopic: KafkaTopic.REALM,
                actionType: RealmTopicAction.SYSTEM_PURGE,
            },
            audit: {
                actionType: ActionType.DELETE,
                entityType: EntityType.PROJECT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const projects = await this.projectService.purge({ identifiers: input.identifiers, transaction, realm });

                return { projects, actor };
            },
        });

        if (projects.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: projects.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
