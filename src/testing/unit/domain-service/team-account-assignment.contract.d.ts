declare namespace Unit.Domain.TeamAccountAssignment {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.TeamAccountAssignment.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
