import { OrgMembershipRepository } from "~context/infrastructure/repositories/org-membership.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { OrganizationService } from "~context/domain/services/organization.service";

export class OrganizationIntegrationHelpers implements Integration.Domain.Organization.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Organization.Service.Context {
        const organizations = new OrganizationRepository(context.readManager);
        const memberships = new OrgMembershipRepository(context.readManager);
        return { organizationService: new OrganizationService(organizations, memberships), organizations, memberships };
    }
}
