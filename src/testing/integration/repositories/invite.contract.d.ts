declare namespace Fixtures.Invite {
    interface Contract extends Fixtures.Core.Contract {
        expirationScenario: ExpirationScenario.Signature;
        filterScenario: FilterScenario.Signature;
    }

    namespace FilterScenario {
        type Result = Promise<{
            organization: Entities.Organization;
            matched: Entities.Invite;
        }>;

        type Signature = () => Result;
    }

    namespace ExpirationScenario {
        type Result = Promise<{
            expired: Entities.Invite;
            expirationDate: Date;
        }>;

        type Signature = () => Result;
    }
}
