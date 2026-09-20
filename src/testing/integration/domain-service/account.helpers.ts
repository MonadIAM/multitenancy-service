import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { InviteRepository } from "~context/infrastructure/repositories/invite.repository";
import { AccountService } from "~context/domain/services/account.service";

import { OrgMembershipIntegrationHelpers } from "./org-membership.helpers";
import { OrganizationIntegrationHelpers } from "./organization.helpers";

export class AccountIntegrationHelpers implements Integration.Domain.Account.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Account.Service.Context {
        const organizations = new OrganizationIntegrationHelpers().service(context).organizationService;
        const memberships = new OrgMembershipIntegrationHelpers().service(context).membershipService;

        return {
            accountService: new AccountService(
                organizations,
                memberships,
                new OrganizationRepository(context.readManager),
                new OrgMembershipRepository(context.readManager),
                new InviteRepository(context.readManager, context.writeManager),
            ),
        };
    }
}
