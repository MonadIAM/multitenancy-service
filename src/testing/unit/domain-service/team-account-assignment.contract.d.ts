import type { TeamAccountAssignmentService } from "~context/domain/services/team-account-assignment.service";

declare global {
    namespace Unit.Domain.TeamAccountAssignment {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<TeamAccountAssignmentService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
