declare namespace Fixtures {
    namespace TeamAccountAssignment {
        interface Contract extends Fixtures.Core.Contract {
            filterScenario: FilterScenario.Signature;
        }

        namespace FilterScenario {
            type Result = Promise<{
                membership: Entities.OrgMembership;
                matched: Entities.TeamAccountAssignment;
                team: Entities.Team;
            }>;
            type Signature = () => Result;
        }
    }
}
