declare namespace Unit.Domain.AuditLog {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Result = Core.Service.Context<globalThis.Services.AuditLog.Contract>;

        type Signature = () => Result;
    }
}
