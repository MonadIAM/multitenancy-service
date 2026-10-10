import { Inject, Injectable, Scope } from "@nestjs/common";

import { SYSTEM_REALM_ID, ActionType, EntityType, RealmTopicAction, KafkaTopic } from "~context/enums";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { ORGANIZATION_SERVICE } from "~context/domain/services";
import { CONSUMER_META } from "~context/constants";

import { OrganizationMapper } from "../mappers/organization.mapper";

@Injectable({ scope: Scope.DEFAULT })
export class OrganizationCommands implements Commands.Organization.Contract {
    private readonly mapper: Commands.Mappers.Organization.Contract;
    private readonly dictionaryPath = "commands.organization";
    private readonly resource = "Organization";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(ORGANIZATION_SERVICE)
        private readonly organizationService: Services.Organization.CommandContract,
    ) {
        this.mapper = new OrganizationMapper();
    }

    public async confirmBootstrap(
        props: Commands.Organization.ConfirmBootstrap.Props,
    ): Commands.Organization.ConfirmBootstrap.Result {
        const { incoming, ...request } = props;

        await this.transactionalService.consume({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.compensationPayload,
                actionType: RealmTopicAction.SYSTEM_PURGE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.CREATE,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            incoming,
            execute: async (transaction) => {
                const result = await this.organizationService.confirmBootstrap({ ...request, transaction });

                return { ...result, actor: request.actor };
            },
        });
    }

    public async rejectBootstrap(
        props: Commands.Organization.RejectBootstrap.Props,
    ): Commands.Organization.RejectBootstrap.Result {
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
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.CREATE,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.organizationService.rejectBootstrap({ ...request, transaction });

                return { ...result, actor: request.actor };
            },
        });
    }

    public async confirmTransfer(
        props: Commands.Organization.ConfirmTransfer.Props,
    ): Commands.Organization.ConfirmTransfer.Result {
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
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.TRANSFER,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.organizationService.confirmTransfer({ ...request, transaction });

                return { ...result, actor: request.actor };
            },
        });
    }

    public async rejectTransfer(
        props: Commands.Organization.RejectTransfer.Props,
    ): Commands.Organization.RejectTransfer.Result {
        const { incoming, ...request } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.TRANSFER,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: (transaction) => this.organizationService.rejectTransfer({ ...request, transaction }),
        });
    }

    public async create(props: Commands.Organization.Create.Props): Commands.Organization.Create.Result {
        const { input, actor } = props;

        await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.bootstrapPayload,
                actionType: RealmTopicAction.BOOTSTRAP_ORGANIZATION_REQUESTED,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.CREATE,
                realm: SYSTEM_REALM_ID,
                ...props,
            },
            changeLog: true,
            execute: (transaction) => {
                const { organization, membership } = this.organizationService.create({
                    transaction,
                    input,
                    actor,
                });

                return { organization, membership };
            },
        });

        return { message: `${this.dictionaryPath}.CREATION_REQUESTED` };
    }

    public async update(props: Commands.Organization.Update.Props): Commands.Organization.Update.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.UPDATE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.organizationService.update({ patch: input.patch, transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.UPDATED` };
    }

    public async transferOwnership(
        props: Commands.Organization.TransferOwnership.Props,
    ): Commands.Organization.TransferOwnership.Result {
        const { input, actor, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.transferPayload,
                actionType: RealmTopicAction.TRANSFER_OWNERSHIP_REQUESTED,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.TRANSFER,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.organizationService.transferOwnership({
                    membership: input.membership,
                    transaction,
                    realm,
                    id,
                });

                return { ...result, actor };
            },
        });

        return { message: `${this.dictionaryPath}.OWNERSHIP_TRANSFER_REQUESTED` };
    }

    public async revoke(props: Commands.Organization.Revoke.Props): Commands.Organization.Revoke.Result {
        const { input, actor, global } = props;

        const { organizations } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.lifecyclePayload,
                actionType: RealmTopicAction.SYSTEM_REVOKE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.REVOKE,
                realm: SYSTEM_REALM_ID,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.organizationService.revoke({
                    identifiers: input.identifiers,
                    transaction,
                    global,
                    actor,
                });

                return { ...result, actor };
            },
        });

        if (organizations.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_REVOKED_COUNT`, params: { count: organizations.length } };
        } else {
            return { message: `${this.dictionaryPath}.REVOKED` };
        }
    }

    public async restore(props: Commands.Organization.Restore.Props): Commands.Organization.Restore.Result {
        const { input, actor, global } = props;

        const { organizations } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.lifecyclePayload,
                actionType: RealmTopicAction.SYSTEM_RESTORE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.RESTORE,
                realm: SYSTEM_REALM_ID,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.organizationService.restore({
                    identifiers: input.identifiers,
                    transaction,
                    global,
                    actor,
                });

                return { ...result, actor };
            },
        });

        if (organizations.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESTORED_COUNT`, params: { count: organizations.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESTORED` };
        }
    }

    public async purge(props: Commands.Organization.Purge.Props): Commands.Organization.Purge.Result {
        const { input, actor, global } = props;

        const { organizations } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.lifecyclePayload,
                actionType: RealmTopicAction.SYSTEM_PURGE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORGANIZATION,
                actionType: ActionType.DELETE,
                realm: SYSTEM_REALM_ID,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.organizationService.purge({
                    identifiers: input.identifiers,
                    transaction,
                    global,
                    actor,
                });

                return { ...result, actor };
            },
        });

        if (organizations.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: organizations.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
