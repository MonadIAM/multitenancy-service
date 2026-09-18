import type { ProjectService } from "~context/domain/services/project.service";

declare global {
    namespace Unit.Domain.Project {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<ProjectService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
