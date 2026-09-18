import { Inject, Injectable, Scope } from "@nestjs/common";

import { INVITE_SERVICE } from "~context/domain/services";
import { INVITE_REPOSITORY } from "~context/infrastructure/repositories";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { ActionType, EntityType } from "~context/enums";
import { SYSTEM_ACCOUNT_ID } from "~context/constants";

@Injectable({ scope: Scope.DEFAULT })
export class InviteCommands implements Commands.Invite.Contract {
    private readonly dictionaryPath = "commands.invite";
    private readonly resource = "Invite";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(INVITE_REPOSITORY)
        private readonly inviteRepository: Repositories.Invite.Contract,
        @Inject(INVITE_SERVICE)
        private readonly inviteService: Services.Invite.CommandContract,
    ) {}

    public async create(props: Commands.Invite.Create.Props): Commands.Invite.Create.Result {
        const { input, actor, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CREATE,
                entityType: EntityType.INVITE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.inviteService.create({
                    input: { ...input, inviter: actor },
                    transaction,
                    realm,
                });
            },
        });

        return { message: `${this.dictionaryPath}.CREATED` };
    }

    public async accept(props: Commands.Invite.Accept.Props): Commands.Invite.Accept.Result {
        const { input, actor, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.ACCEPT,
                entityType: EntityType.INVITE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.inviteService.accept({
                    input: { invite: input.invite, invitee: actor },
                    transaction,
                    realm,
                });
            },
        });

        return { message: `${this.dictionaryPath}.ACCEPTED` };
    }

    public async decline(props: Commands.Invite.Decline.Props): Commands.Invite.Decline.Result {
        const { input, actor, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.DECLINE,
                entityType: EntityType.INVITE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.inviteService.decline({
                    input: { invite: input.invite, invitee: actor },
                    transaction,
                    realm,
                });
            },
        });

        return { message: `${this.dictionaryPath}.DECLINED` };
    }

    public async cancel(props: Commands.Invite.Cancel.Props): Commands.Invite.Cancel.Result {
        const { input, actor, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CANCEL,
                entityType: EntityType.INVITE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.inviteService.cancel({
                    input: { invite: input.invite, inviter: actor },
                    transaction,
                    realm,
                });
            },
        });

        return { message: `${this.dictionaryPath}.CANCELLED` };
    }

    public async invalidate(props: Commands.Invite.Invalidate.Props): Commands.Invite.Invalidate.Result {
        const { input, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.INVALIDATE,
                entityType: EntityType.INVITE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.inviteService.invalidate({ input, transaction, realm });
            },
        });
    }

    public async expire(props: Commands.Invite.Expire.Props): Commands.Invite.Expire.Result {
        const invites = await this.inviteRepository.findExpiredPending({
            expirationDate: props.expirationDate,
            batchSize: props.batchSize,
        });

        if (invites.length) {
            await this.transactionalService.run({
                resource: this.resource,
                audit: {
                    actor: SYSTEM_ACCOUNT_ID,
                    entityType: EntityType.INVITE,
                    actionType: ActionType.EXPIRE,
                    input: {
                        identifiers: invites.map(({ id }) => id),
                        expiresAt: props.expirationDate.toISOString(),
                        reason: "expired",
                    },
                    context: {
                        userAgent: "scheduler",
                        ip: "127.0.0.1",
                    },
                },
                changeLog: true,
                execute: (transaction) => {
                    this.inviteService.expire({ entities: invites, at: props.expirationDate, transaction });

                    return invites;
                },
            });

            return invites.length;
        } else {
            return 0;
        }
    }
}
