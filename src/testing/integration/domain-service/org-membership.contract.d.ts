declare namespace Integration.Domain.OrgMembership {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    namespace Service {
        type Context = {
            membershipService: Services.OrgMembership.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }

    interface Contract {
        service: Service.Signature;
    }
}
