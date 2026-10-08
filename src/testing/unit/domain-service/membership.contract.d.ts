declare namespace Unit.Domain.Membership {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.Membership.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
