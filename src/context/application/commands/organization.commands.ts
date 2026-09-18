import { Inject, Injectable, Scope } from "@nestjs/common";

import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { ORGANIZATION_SERVICE } from "~context/domain/services";
import { ActionType, EntityType } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class OrganizationCommands implements Commands.Organization.Contract {
    private readonly dictionaryPath = "commands.organization";
    private readonly resource = "Organization";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(ORGANIZATION_SERVICE)
        private readonly organizationService: Services.Organization.CommandContract,
    ) {}

    public async create(props: Commands.Organization.Create.Props): Commands.Organization.Create.Result {
        const { input, actor } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CREATE,
                entityType: EntityType.ORGANIZATION,
                realm: input.realm,
                ...props,
            },
            changeLog: true,
            execute: (transaction) => {
                const { organization, membership } = this.organizationService.create({
                    transaction,
                    input,
                    actor,
                });

                return [organization, membership];
            },
        });

        return { message: `${this.dictionaryPath}.CREATED` };
    }

    public async update(props: Commands.Organization.Update.Props): Commands.Organization.Update.Result {
        const { input, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.ORGANIZATION,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.organizationService.update({ patch: input.patch, transaction, id });
            },
        });

        return { message: `${this.dictionaryPath}.UPDATED` };
    }

    public async transferOwnership(
        props: Commands.Organization.TransferOwnership.Props,
    ): Commands.Organization.TransferOwnership.Result {
        const { input, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.TRANSFER,
                entityType: EntityType.ORGANIZATION,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.organizationService.transferOwnership({
                    membership: input.membership,
                    transaction,
                    id,
                });
            },
        });

        return { message: `${this.dictionaryPath}.OWNERSHIP_TRANSFERRED` };
    }

    public async revoke(props: Commands.Organization.Revoke.Props): Commands.Organization.Revoke.Result {
        const { input } = props;

        const organizations = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.REVOKE,
                entityType: EntityType.ORGANIZATION,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.organizationService.revoke({ identifiers: input.identifiers, transaction });
            },
        });

        if (organizations.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_REVOKED_COUNT`, params: { count: organizations.length } };
        } else {
            return { message: `${this.dictionaryPath}.REVOKED` };
        }
    }

    public async restore(props: Commands.Organization.Restore.Props): Commands.Organization.Restore.Result {
        const { input } = props;

        const organizations = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.RESTORE,
                entityType: EntityType.ORGANIZATION,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.organizationService.restore({ identifiers: input.identifiers, transaction });
            },
        });

        if (organizations.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESTORED_COUNT`, params: { count: organizations.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESTORED` };
        }
    }

    public async purge(props: Commands.Organization.Purge.Props): Commands.Organization.Purge.Result {
        const { input } = props;

        const organizations = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.DELETE,
                entityType: EntityType.ORGANIZATION,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.organizationService.purge({ identifiers: input.identifiers, transaction });
            },
        });

        if (organizations.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: organizations.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
