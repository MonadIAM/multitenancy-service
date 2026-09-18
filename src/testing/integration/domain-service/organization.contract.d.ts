import type { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import type { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import type { OrganizationService } from "~context/domain/services/organization.service";

declare global {
    namespace Integration.Domain.Organization {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                organizationService: OrganizationService;
                organizations: OrganizationRepository;
                memberships: OrgMembershipRepository;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
