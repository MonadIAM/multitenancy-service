declare namespace Integration.Domain.AuditLog {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    namespace Service {
        type Context = {
            auditLogService: Services.AuditLog.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }

    interface Contract {
        service: Service.Signature;
    }
}
