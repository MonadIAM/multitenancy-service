import { Inject, Injectable, Scope } from "@nestjs/common";

import { PositionTopicAction, KafkaTopic, ActionType, EntityType } from "~context/enums";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { POSITION_SERVICE } from "~context/domain/services";
import { CONSUMER_META } from "~context/constants";
import { Exception } from "~common/exceptions";

import { PositionMapper } from "../mappers/position.mapper";

@Injectable({ scope: Scope.DEFAULT })
export class PositionCommands implements Commands.Position.Contract {
    private readonly mapper: Commands.Mappers.Position.Contract;
    private readonly resource = "Position";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(POSITION_SERVICE)
        private readonly positionService: Services.Position.CommandContract,
    ) {
        this.mapper = new PositionMapper();
    }

    public async validatePlacement(
        props: Commands.Position.ValidatePlacement.Props,
    ): Commands.Position.ValidatePlacement.Result {
        const { incoming, ...request } = props;

        try {
            await this.transactionalService.consume({
                incoming,
                resource: this.resource,
                outbox: {
                    payloadMapper: this.mapper.confirmed,
                    actionType: PositionTopicAction.PLACEMENT_CONFIRMED,
                    destinationTopic: KafkaTopic.POSITION,
                },
                audit: {
                    entityType: EntityType.POSITION,
                    actionType: ActionType.UPDATE,
                    context: CONSUMER_META,
                    ...request,
                },
                changeLog: true,
                execute: async (transaction) => {
                    await this.positionService.validatePlacement({ ...request, transaction });
                    return { request };
                },
            });
        } catch (error) {
            if (!(error instanceof Exception) || Boolean(Exception.isRetryable(error))) {
                throw error;
            } else {
                await this.rejectPlacement({ incoming, request, reason: error.message });
            }
        }
    }

    public async rejectPlacement(props: Commands.Position.RejectPlacement.Props): Commands.Position.RejectPlacement.Result {
        const { incoming, ...result } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            payload: this.mapper.rejected(result),
            destinationTopic: KafkaTopic.POSITION,
            actionType: PositionTopicAction.PLACEMENT_REJECTED,
            audit: {
                entityType: EntityType.POSITION,
                actionType: ActionType.UPDATE,
                actor: result.request.actor,
                realm: result.request.realm,
                context: CONSUMER_META,
                input: result,
            },
        });
    }

    public async completeReference(
        props: Commands.Position.CompleteReference.Props,
    ): Commands.Position.CompleteReference.Result {
        const { incoming, rejected, ...request } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            audit: {
                entityType: EntityType.POSITION,
                actionType: ActionType.UPDATE,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.positionService.completeReference({ ...request, transaction, rejected });
            },
        });
    }

    public async release(props: Commands.Position.Release.Props): Commands.Position.Release.Result {
        const { incoming, ...request } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            audit: {
                entityType: EntityType.POSITION,
                actionType: ActionType.UPDATE,
                context: CONSUMER_META,
                ...request,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.positionService.release({ ...request, transaction });
            },
        });
    }
}
