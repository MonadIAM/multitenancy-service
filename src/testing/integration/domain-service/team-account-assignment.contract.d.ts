import type { TeamAccountAssignmentService } from "~context/domain/services/team-account-assignment.service";

declare global {
    namespace Integration.Domain.TeamAccountAssignment {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                assignmentService: TeamAccountAssignmentService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
