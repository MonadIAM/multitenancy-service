declare namespace Unit.Domain.Position {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.Position.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
