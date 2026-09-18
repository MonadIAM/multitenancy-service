import type { TeamService } from "~context/domain/services/team.service";

declare global {
    namespace Unit.Domain.Team {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<TeamService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
