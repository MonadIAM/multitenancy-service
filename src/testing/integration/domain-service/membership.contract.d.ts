declare namespace Integration.Domain.Membership {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    namespace Service {
        type Context = {
            membershipService: Services.Membership.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }

    interface Contract {
        service: Service.Signature;
    }
}
