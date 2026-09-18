import type { DepartmentService } from "~context/domain/services/department.service";

declare global {
    namespace Unit.Domain.Department {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<DepartmentService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
