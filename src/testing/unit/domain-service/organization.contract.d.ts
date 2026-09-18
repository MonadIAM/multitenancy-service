import type { OrganizationService } from "~context/domain/services/organization.service";

declare global {
    namespace Unit.Domain.Organization {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Props = RepositoryMockBank.Repositories.Props;

            type Result = Core.Service.Context<OrganizationService>;

            type Signature = (props?: Props) => Result;
        }
    }
}
