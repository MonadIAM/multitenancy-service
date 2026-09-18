import { describe, expect, it } from "@jest/globals";

import { AuditLogIntegrationHelpers } from "~testing/integration/domain-service/audit-log.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { AuditLog } from "~common/transaction-manager/entities";

const helpers = new AuditLogIntegrationHelpers();

describe("AuditLogService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("purges only expired entries up to the batch size", async () => {
        const expired = await suite.fixtures().createAuditLog({ createdAt: new Date("2020-01-01T00:00:00.000Z") });
        const active = await suite.fixtures().createAuditLog({ createdAt: new Date("2030-01-01T00:00:00.000Z") });

        await suite.transaction((transaction) =>
            suite.repository().auditLogService.purgeExpired({
                expirationDate: new Date("2025-01-01T00:00:00.000Z"),
                batchSize: 10,
                transaction,
            }),
        );

        await expect(suite.transaction((transaction) => transaction.count(AuditLog, { id: expired.id }))).resolves.toBe(0);
        await expect(suite.transaction((transaction) => transaction.count(AuditLog, { id: active.id }))).resolves.toBe(1);
    });
});
