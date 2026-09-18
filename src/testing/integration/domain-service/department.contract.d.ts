import type { DepartmentService } from "~context/domain/services/department.service";

declare global {
    namespace Integration.Domain.Department {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                departmentService: DepartmentService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
