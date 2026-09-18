import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { InviteRepository } from "~context/infrastructure/repositories/invite.repository";
import { InviteService } from "~context/domain/services/invite.service";

import { OrgMembershipIntegrationHelpers } from "./org-membership.helpers";

export class InviteIntegrationHelpers implements Integration.Domain.Invite.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Invite.Service.Context {
        const memberships = new OrgMembershipRepository(context.readManager);
        const organizations = new OrganizationRepository(context.readManager);
        const invites = new InviteRepository(context.readManager, context.writeManager);
        const membershipService = new OrgMembershipIntegrationHelpers().service(context).membershipService;
        return { inviteService: new InviteService(membershipService, memberships, organizations, invites) };
    }
}
