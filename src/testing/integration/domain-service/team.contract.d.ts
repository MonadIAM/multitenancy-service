import type { TeamService } from "~context/domain/services/team.service";

declare global {
    namespace Integration.Domain.Team {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                teamService: TeamService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
