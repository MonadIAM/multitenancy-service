import type { OrgMembershipService } from "~context/domain/services/org-membership.service";

declare global {
    namespace Integration.Domain.OrgMembership {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                membershipService: OrgMembershipService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
