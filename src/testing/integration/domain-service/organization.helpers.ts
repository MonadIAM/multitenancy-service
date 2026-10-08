import { MembershipRepository } from "~context/infrastructure/repositories/membership.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { ProjectRepository } from "~context/infrastructure/repositories/project.repository";
import { OrganizationService } from "~context/domain/services/organization.service";

export class OrganizationIntegrationHelpers implements Integration.Domain.Organization.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Organization.Service.Context {
        const organizations = new OrganizationRepository(context.readManager);
        const memberships = new MembershipRepository(context.readManager);
        return {
            organizationService: new OrganizationService(
                new ProjectRepository(context.readManager),
                organizations,
                memberships,
            ),
            organizations,
            memberships,
        };
    }
}
