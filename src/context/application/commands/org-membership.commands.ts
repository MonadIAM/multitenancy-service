import { Inject, Injectable, Scope } from "@nestjs/common";

import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { ORG_MEMBERSHIP_SERVICE } from "~context/domain/services";
import { ActionType, EntityType } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class OrgMembershipCommands implements Commands.OrgMembership.Contract {
    private readonly dictionaryPath = "commands.org-membership";
    private readonly resource = "OrgMembership";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(ORG_MEMBERSHIP_SERVICE)
        private readonly membershipService: Services.OrgMembership.CommandContract,
    ) {}

    public async join(props: Commands.OrgMembership.Join.Props): Commands.OrgMembership.Join.Result {
        const { input, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CREATE,
                entityType: EntityType.ORG_MEMBERSHIP,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.membershipService.join({ input, transaction, realm });
            },
        });

        return { message: `${this.dictionaryPath}.JOINED` };
    }

    public async suspend(props: Commands.OrgMembership.Suspend.Props): Commands.OrgMembership.Suspend.Result {
        const { input, realm } = props;

        const memberships = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.SUSPEND,
                entityType: EntityType.ORG_MEMBERSHIP,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.membershipService.suspend({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_SUSPENDED_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.SUSPENDED` };
        }
    }

    public async resume(props: Commands.OrgMembership.Resume.Props): Commands.OrgMembership.Resume.Result {
        const { input, realm } = props;

        const memberships = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.RESUME,
                entityType: EntityType.ORG_MEMBERSHIP,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.membershipService.resume({ identifiers: input.identifiers, transaction, realm });
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
            audit: {
                actionType: ActionType.LEAVE,
                entityType: EntityType.ORG_MEMBERSHIP,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.membershipService.leave({
                    identifiers: input.identifiers,
                    account: actor,
                    transaction,
                    realm,
                });
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_LEFT_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.LEFT` };
        }
    }

    public async block(props: Commands.OrgMembership.Block.Props): Commands.OrgMembership.Block.Result {
        const { input, realm } = props;

        const { memberships } = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.BLOCK,
                entityType: EntityType.ORG_MEMBERSHIP,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.membershipService.block({
                    identifiers: input.identifiers,
                    transaction,
                    realm,
                });
            },
        });

        if (memberships.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_BLOCKED_COUNT`, params: { count: memberships.length } };
        } else {
            return { message: `${this.dictionaryPath}.BLOCKED` };
        }
    }
}
