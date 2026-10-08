declare namespace Fixtures.DepartmentClosure {
    interface Contract extends Fixtures.Department.Contract {
        createDetachedDepartment(organization: Entities.Organization): Promise<Entities.Department>;
        tree(): Tree.Result;
    }

    namespace Tree {
        type Result = Promise<{
            organization: Entities.Organization;
            a: Entities.Department;
            b: Entities.Department;
            c: Entities.Department;
            d: Entities.Department;
            x: Entities.Department;
        }>;
    }
}
