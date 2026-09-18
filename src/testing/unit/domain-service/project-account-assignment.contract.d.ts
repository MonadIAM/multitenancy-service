import type { ProjectAccountAssignmentService } from "~context/domain/services/project-account-assignment.service";

declare global {
    namespace Unit.Domain.ProjectAccountAssignment {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<ProjectAccountAssignmentService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
