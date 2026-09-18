import type { DeptAccountAssignmentService } from "~context/domain/services/dept-account-assignment.service";

declare global {
    namespace Integration.Domain.DeptAccountAssignment {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                assignmentService: DeptAccountAssignmentService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
