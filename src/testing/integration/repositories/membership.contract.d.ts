declare namespace Fixtures.Membership {
    interface Contract extends Fixtures.Core.Contract {
        filterScenario: FilterScenario.Signature;
    }

    namespace FilterScenario {
        type Result = Promise<{
            organization: Entities.Organization;
            matched: Entities.Membership;
            account: string;
        }>;

        type Signature = () => Result;
    }
}
