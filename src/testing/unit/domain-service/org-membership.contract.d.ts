declare namespace Unit.Domain.OrgMembership {
    interface Contract extends Core.Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Props = RepositoryMockBank.Repositories.Props;

        type Result = Core.Service.Context<globalThis.Services.OrgMembership.Contract>;

        type Signature = (props?: Props) => Result;
    }
}
