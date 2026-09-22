declare namespace Unit.Domain.Organization {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.Organization.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
