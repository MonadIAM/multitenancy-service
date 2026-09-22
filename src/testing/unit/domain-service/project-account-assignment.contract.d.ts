declare namespace Unit.Domain.ProjectAccountAssignment {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.ProjectAccountAssignment.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
