import { describe, expect, it } from "@jest/globals";

import { ChangeLogIntegrationHelpers } from "~testing/integration/domain-service/change-log.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { ChangeLog } from "~common/transaction-manager/entities";

const helpers = new ChangeLogIntegrationHelpers();

describe("ChangeLogService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("purges only expired entries up to the batch size", async () => {
        const expired = await suite.fixtures().createChangeLog({
            createdAt: new Date("2020-01-01T00:00:00.000Z"),
        });
        const active = await suite.fixtures().createChangeLog({
            createdAt: new Date("2030-01-01T00:00:00.000Z"),
        });

        await suite.transaction((transaction) =>
            suite.repository().changeLogService.purgeExpired({
                expirationDate: new Date("2025-01-01T00:00:00.000Z"),
                batchSize: 10,
                transaction,
            }),
        );

        await expect(suite.transaction((transaction) => transaction.count(ChangeLog, { id: expired.id }))).resolves.toBe(0);
        await expect(suite.transaction((transaction) => transaction.count(ChangeLog, { id: active.id }))).resolves.toBe(1);
    });
});
