declare namespace Integration.Domain.Account {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    interface Contract {
        service: Service.Signature;
    }

    namespace Service {
        type Context = {
            accountService: Services.Account.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }
}
