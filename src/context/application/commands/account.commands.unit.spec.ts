import { describe, expect, it } from "@jest/globals";

import { AccountCommandsUnitHelpers } from "~testing/unit/command-services/account.helpers";
import { KafkaTopic, RealmTopicAction } from "~context/enums";

const ACCOUNT = "target-account";
const INCOMING: TransactionManager.Service.IncomingMessage = { consumerKey: "unit-consumer", event: "incoming-event" };
const helpers = new AccountCommandsUnitHelpers();

describe("AccountCommands", () => {
    describe("purge", () => {
        it("consumes account deletion and schedules realm and access cleanup together", async () => {
            const { commands, accountService, transaction, consume } = helpers.commands();

            await commands.purge({ incoming: INCOMING, account: ACCOUNT });

            expect(accountService.purge.mock.calls).toEqual([
                [{ account: ACCOUNT, transaction: transaction.entityManager }],
            ]);
            expect(consume.mock.calls).toEqual([
                [
                    expect.objectContaining({
                        incoming: INCOMING,
                        outbox: [
                            expect.objectContaining({
                                destinationTopic: KafkaTopic.REALM,
                                actionType: RealmTopicAction.SYSTEM_PURGE,
                            }),
                            expect.objectContaining({
                                destinationTopic: KafkaTopic.REALM,
                                actionType: RealmTopicAction.ACCOUNT_ACCESS_PURGE,
                            }),
                        ],
                    }),
                ],
            ]);
        });
    });
});
