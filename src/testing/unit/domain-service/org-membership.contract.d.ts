import type { OrgMembershipService } from "~context/domain/services/org-membership.service";

declare global {
    namespace Unit.Domain.OrgMembership {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<OrgMembershipService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
