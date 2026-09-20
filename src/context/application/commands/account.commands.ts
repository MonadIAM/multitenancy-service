import { Inject, Injectable, Scope } from "@nestjs/common";

import { CONSUMER_META, SYSTEM_ACCOUNT_ID, SYSTEM_REALM_ID } from "~context/constants";
import { ActionType, EntityType, KafkaTopic, RealmTopicAction } from "~context/enums";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { ACCOUNT_SERVICE } from "~context/domain/services";

import { AccountMapper } from "../mappers/account.mapper";

@Injectable({ scope: Scope.DEFAULT })
export class AccountCommands implements Commands.Account.Contract {
    private readonly mapper: Commands.Mappers.Account.Contract;
    private readonly resource = "Account";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(ACCOUNT_SERVICE)
        private readonly accountService: Services.Account.ConsumerContract,
    ) {
        this.mapper = new AccountMapper();
    }

    public async purge(props: Commands.Account.Purge.Props): Commands.Account.Purge.Result {
        const { incoming, account } = props;

        await this.transactionalService.consume({
            incoming,
            resource: this.resource,
            outbox: [
                {
                    payloadMapper: this.mapper.realmPurgePayload,
                    actionType: RealmTopicAction.SYSTEM_PURGE,
                    destinationTopic: KafkaTopic.REALM,
                },
                {
                    payloadMapper: this.mapper.accessPurgePayload,
                    actionType: RealmTopicAction.ACCOUNT_ACCESS_PURGE,
                    destinationTopic: KafkaTopic.REALM,
                },
            ],
            audit: {
                entityType: EntityType.ORG_MEMBERSHIP,
                actionType: ActionType.DELETE,
                actor: SYSTEM_ACCOUNT_ID,
                context: CONSUMER_META,
                realm: SYSTEM_REALM_ID,
                input: { account },
            },
            changeLog: true,
            execute: (transaction) => this.accountService.purge({ transaction, account }),
        });
    }
}
