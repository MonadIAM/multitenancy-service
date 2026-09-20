import { Inject, Injectable, Scope } from "@nestjs/common";

import { ActionType, EntityType, RealmTopicAction, KafkaTopic } from "~context/enums";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { ORG_MEMBERSHIP_SERVICE } from "~context/domain/services";

import { OrgMembershipMapper } from "../mappers/org-membership.mapper";

@Injectable({ scope: Scope.DEFAULT })
export class OrgMembershipCommands implements Commands.OrgMembership.Contract {
    private readonly mapper: Commands.Mappers.OrgMembership.Contract;
    private readonly dictionaryPath = "commands.org-membership";
    private readonly resource = "OrgMembership";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(ORG_MEMBERSHIP_SERVICE)
        private readonly membershipService: Services.OrgMembership.CommandContract,
    ) {
        this.mapper = new OrgMembershipMapper();
    }

    public async join(props: Commands.OrgMembership.Join.Props): Commands.OrgMembership.Join.Result {
        const { input, actor, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.joinPayload,
                actionType: RealmTopicAction.MEMBERSHIP_JOIN_REQUESTED,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORG_MEMBERSHIP,
                actionType: ActionType.CREATE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const membership = await this.membershipService.join({ input, transaction, realm });

                return { membership, actor };
            },
        });

        return { message: `${this.dictionaryPath}.JOIN_REQUESTED` };
    }

    public async suspend(props: Commands.OrgMembership.Suspend.Props): Commands.OrgMembership.Suspend.Result {
        const { input, realm, actor } = props;

        const { memberships } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.accessPayload,
                actionType: RealmTopicAction.ACCOUNT_ACCESS_REVOKE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORG_MEMBERSHIP,
                actionType: ActionType.SUSPEND,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.membershipService.suspend({ identifiers: input.identifiers, transaction, realm });

                return { ...result, actor };
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_SUSPENDED_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.SUSPENDED` };
        }
    }

    public async resume(props: Commands.OrgMembership.Resume.Props): Commands.OrgMembership.Resume.Result {
        const { input, realm, actor } = props;

        const { memberships } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.accessPayload,
                actionType: RealmTopicAction.ACCOUNT_ACCESS_RESTORE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORG_MEMBERSHIP,
                actionType: ActionType.RESUME,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.membershipService.resume({ identifiers: input.identifiers, transaction, realm });

                return { ...result, actor };
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESUMED_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESUMED` };
        }
    }

    public async leave(props: Commands.OrgMembership.Leave.Props): Commands.OrgMembership.Leave.Result {
        const { input, actor, realm } = props;

        const { memberships } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.accessPayload,
                actionType: RealmTopicAction.ACCOUNT_ACCESS_PURGE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORG_MEMBERSHIP,
                actionType: ActionType.LEAVE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.membershipService.leave({
                    identifiers: input.identifiers,
                    account: actor,
                    transaction,
                    realm,
                });

                return { ...result, actor };
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_LEFT_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.LEFT` };
        }
    }

    public async block(props: Commands.OrgMembership.Block.Props): Commands.OrgMembership.Block.Result {
        const { input, realm, actor } = props;

        const { memberships } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.accessPayload,
                actionType: RealmTopicAction.ACCOUNT_ACCESS_PURGE,
                destinationTopic: KafkaTopic.REALM,
            },
            audit: {
                entityType: EntityType.ORG_MEMBERSHIP,
                actionType: ActionType.BLOCK,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const result = await this.membershipService.block({
                    identifiers: input.identifiers,
                    transaction,
                    realm,
                });

                return { ...result, actor };
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_BLOCKED_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.BLOCKED` };
        }
    }
}
