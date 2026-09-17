declare namespace Fixtures {
    namespace Team {
        interface Contract extends Fixtures.Core.Contract {
            lookupSearchScenario: LookupSearchScenario.Signature;
            filterScenario: FilterScenario.Signature;
        }

        namespace FilterScenario {
            type Result = Promise<{
                organization: Entities.Organization;
                department: Entities.Department;
                matched: Entities.Team;
            }>;
            type Signature = () => Result;
        }

        namespace LookupSearchScenario {
            type Result = Promise<{
                organization: Entities.Organization;
                department: Entities.Department;
                expectedNames: string[];
                exact: Entities.Team;
                term: string;
            }>;
            type Signature = () => Result;
        }
    }
}
