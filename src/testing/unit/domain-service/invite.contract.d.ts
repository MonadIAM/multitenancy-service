import type { InviteService } from "~context/domain/services/invite.service";

declare global {
    namespace Unit.Domain.Invite {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<InviteService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
