import { AuditLogService } from "~context/domain/services/audit-log.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class AuditLogUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.AuditLog.Contract {
    public service(): Unit.Domain.AuditLog.Service.Result {
        const repositories = this.repositories();
        return {
            service: new AuditLogService(this.contract<Repositories.AuditLog.Contract>(repositories.auditLogs)),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
