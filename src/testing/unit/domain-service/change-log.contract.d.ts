declare namespace Unit.Domain.ChangeLog {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Result = Core.Service.Context<globalThis.Services.ChangeLog.Contract>;

        type Signature = () => Result;
    }
}
