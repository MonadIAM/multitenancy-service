declare namespace Unit.Domain.Team {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.Team.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
