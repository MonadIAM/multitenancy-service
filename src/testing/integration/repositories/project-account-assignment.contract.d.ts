declare namespace Fixtures {
    namespace ProjectAccountAssignment {
        interface Contract extends Fixtures.Core.Contract {
            filterScenario: FilterScenario.Signature;
        }

        namespace FilterScenario {
            type Result = Promise<{
                membership: Entities.OrgMembership;
                project: Entities.Project;
                matched: Entities.ProjectAccountAssignment;
            }>;
            type Signature = () => Result;
        }
    }
}
