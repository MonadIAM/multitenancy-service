import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { DepartmentRepository } from "~context/infrastructure/repositories/department.repository";
import { DepartmentService } from "~context/domain/services/department.service";

export class DepartmentIntegrationHelpers implements Integration.Domain.Department.Contract {
    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Department.Service.Context {
        return {
            departmentService: new DepartmentService(
                new OrganizationRepository(context.readManager),
                new DepartmentRepository(context.readManager),
            ),
        };
    }
}
