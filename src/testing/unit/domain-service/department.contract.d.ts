declare namespace Unit.Domain.Department {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.Department.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
