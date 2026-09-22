declare namespace Integration.Domain.Invite {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    namespace Service {
        type Context = {
            inviteService: Services.Invite.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }

    interface Contract {
        service: Service.Signature;
    }
}
