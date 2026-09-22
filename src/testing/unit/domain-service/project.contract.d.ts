declare namespace Unit.Domain.Project {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.Project.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
