declare namespace Fixtures {
    namespace Organization {
        interface Contract extends Fixtures.Core.Contract {
            lookupSearchScenario: LookupSearchScenario.Signature;
            filterScenario: FilterScenario.Signature;
        }

        namespace FilterScenario {
            type Result = Promise<{ matched: Entities.Organization }>;
            type Signature = () => Result;
        }

        namespace LookupSearchScenario {
            type Result = Promise<{
                exact: Entities.Organization;
                expectedTitles: string[];
                term: string;
            }>;
            type Signature = () => Result;
        }
    }
}
