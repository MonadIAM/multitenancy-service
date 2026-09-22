declare namespace Fixtures.Project {
    interface Contract extends Fixtures.Core.Contract {
        lookupSearchScenario: LookupSearchScenario.Signature;
        filterScenario: FilterScenario.Signature;
    }

    namespace FilterScenario {
        type Result = Promise<{
            organization: Entities.Organization;
            matched: Entities.Project;
        }>;

        type Signature = () => Result;
    }

    namespace LookupSearchScenario {
        type Result = Promise<{
            organization: Entities.Organization;
            expectedNames: string[];
            exact: Entities.Project;
            term: string;
        }>;

        type Signature = () => Result;
    }
}
