declare namespace Integration.Domain.Organization {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    namespace Service {
        type Context = {
            organizationService: Services.Organization.Contract;
            organizations: Repositories.Organization.Contract;
            memberships: Repositories.OrgMembership.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }

    interface Contract {
        service: Service.Signature;
    }
}
