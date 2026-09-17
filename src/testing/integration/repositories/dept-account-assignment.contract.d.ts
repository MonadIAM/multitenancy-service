declare namespace Fixtures {
    namespace DeptAccountAssignment {
        interface Contract extends Fixtures.Core.Contract {
            filterScenario: FilterScenario.Signature;
        }

        namespace FilterScenario {
            type Result = Promise<{
                membership: Entities.OrgMembership;
                department: Entities.Department;
                matched: Entities.DeptAccountAssignment;
            }>;
            type Signature = () => Result;
        }
    }
}
