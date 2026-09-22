declare namespace Fixtures.DeptAccountAssignment {
    interface Contract extends Fixtures.Core.Contract {
        filterScenario: FilterScenario.Signature;
    }

    namespace FilterScenario {
        type Result = Promise<{
            matched: Entities.DeptAccountAssignment;
            membership: Entities.OrgMembership;
            department: Entities.Department;
        }>;

        type Signature = () => Result;
    }
}
