import { DepartmentClosureRepository } from "~context/infrastructure/repositories/department-closure.repository";
import { OrganizationRepository } from "~context/infrastructure/repositories/organization.repository";
import { DepartmentRepository } from "~context/infrastructure/repositories/department.repository";
import { DepartmentService } from "~context/domain/services/department.service";

export class DepartmentIntegrationHelpers implements Integration.Domain.Department.Contract {
    public async tree(suite: Integration.Domain.Department.Suite): Integration.Domain.Department.Tree.Result {
        const organization = await suite.fixtures().createOrganization();
        const a = await suite.transaction((transaction) =>
            this.serviceCreate(suite, { name: "A", description: "A" }, organization.id, organization.realm, transaction),
        );
        const b = await suite.transaction((transaction) =>
            this.serviceCreate(
                suite,
                { name: "B", description: "B", parent: a.id },
                organization.id,
                organization.realm,
                transaction,
            ),
        );
        const c = await suite.transaction((transaction) =>
            this.serviceCreate(
                suite,
                { name: "C", description: "C", parent: b.id },
                organization.id,
                organization.realm,
                transaction,
            ),
        );
        const d = await suite.transaction((transaction) =>
            this.serviceCreate(
                suite,
                { name: "D", description: "D", parent: c.id },
                organization.id,
                organization.realm,
                transaction,
            ),
        );
        const x = await suite.transaction((transaction) =>
            this.serviceCreate(suite, { name: "X", description: "X" }, organization.id, organization.realm, transaction),
        );
        return { organization, a, b, c, d, x };
    }

    public async serviceCreate(
        suite: Integration.Domain.Department.Suite,
        input: Services.Department.Create.Props["input"],
        organization: string,
        realm: string,
        transaction: ORM.EntityManager,
    ): Services.Department.Create.Result {
        return await suite.repository().departmentService.create({ input, organization, realm, transaction });
    }

    public service(context: Integration.Postgres.Suite.FactoryContext): Integration.Domain.Department.Service.Context {
        return {
            departmentRepository: new DepartmentRepository(context.readManager),
            departmentService: new DepartmentService(
                new OrganizationRepository(context.readManager),
                new DepartmentRepository(context.readManager),
                new DepartmentClosureRepository(),
            ),
        };
    }
}
