import type { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";

declare global {
    namespace Integration.Domain.ProjectAccountAssignment {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                assignmentService: ProjectAccountAssignmentService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
