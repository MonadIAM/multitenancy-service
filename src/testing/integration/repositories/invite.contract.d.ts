declare namespace Fixtures {
    namespace Invite {
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
                expirationDate: Date;
                expired: Entities.Invite;
            }>;
            type Signature = () => Result;
        }
    }
}
