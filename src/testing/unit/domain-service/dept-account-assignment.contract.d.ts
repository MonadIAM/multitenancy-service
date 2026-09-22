declare namespace Unit.Domain.DeptAccountAssignment {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.DeptAccountAssignment.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
