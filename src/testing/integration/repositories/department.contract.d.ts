declare namespace Fixtures {
    namespace Department {
        interface Contract extends Fixtures.Core.Contract {
            lookupSearchScenario: LookupSearchScenario.Signature;
            filterScenario: FilterScenario.Signature;
        }

        namespace FilterScenario {
            type Result = Promise<{
                organization: Entities.Organization;
                matched: Entities.Department;
            }>;
            type Signature = () => Result;
        }

        namespace LookupSearchScenario {
            type Result = Promise<{
                organization: Entities.Organization;
                expectedNames: string[];
                exact: Entities.Department;
                term: string;
            }>;
            type Signature = () => Result;
        }
    }
}
