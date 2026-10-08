declare namespace Integration.Domain.Department {
    type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

    namespace Service {
        type Context = {
            departmentRepository: Repositories.Department.Contract;
            departmentService: Services.Department.Contract;
        };

        type Signature = (context: Postgres.Suite.FactoryContext) => Context;
    }

    namespace Tree {
        type Result = Promise<{
            organization: Entities.Organization;
            a: Entities.Department;
            b: Entities.Department;
            c: Entities.Department;
            d: Entities.Department;
            x: Entities.Department;
        }>;
    }

    interface Contract {
        tree(suite: Suite): Tree.Result;
        serviceCreate(
            suite: Suite,
            input: Services.Department.Create.Props["input"],
            organization: string,
            realm: string,
            transaction: ORM.EntityManager,
        ): Services.Department.Create.Result;
        service: Service.Signature;
    }
}
