declare namespace Fixtures.OrgMembership {
    interface Contract extends Fixtures.Core.Contract {
        filterScenario: FilterScenario.Signature;
    }

    namespace FilterScenario {
        type Result = Promise<{
            organization: Entities.Organization;
            matched: Entities.OrgMembership;
            account: string;
        }>;

        type Signature = () => Result;
    }
}
