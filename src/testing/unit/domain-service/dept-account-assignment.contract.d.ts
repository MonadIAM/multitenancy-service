import type { DeptAccountAssignmentService } from "~context/domain/services/dept-account-assignment.service";

declare global {
    namespace Unit.Domain.DeptAccountAssignment {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<DeptAccountAssignmentService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
