import { AuditLogRepository } from "~context/infrastructure/repositories/audit-log.repository";
import { AuditLogService } from "~context/domain/services/audit-log.service";

export class AuditLogIntegrationHelpers implements Integration.Domain.AuditLog.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.AuditLog.Service.Context {
        return { auditLogService: new AuditLogService(new AuditLogRepository(context.readManager)) };
    }
}
