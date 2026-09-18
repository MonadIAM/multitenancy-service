import type { AuditLogService } from "~context/domain/services/audit-log.service";

declare global {
    namespace Unit.Domain.AuditLog {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Result = Core.Service.Context<AuditLogService>;

            type Signature = () => Result;
        }
    }
}
