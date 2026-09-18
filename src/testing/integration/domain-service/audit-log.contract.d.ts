import type { AuditLogService } from "~context/domain/services/audit-log.service";

declare global {
    namespace Integration.Domain.AuditLog {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                auditLogService: AuditLogService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
