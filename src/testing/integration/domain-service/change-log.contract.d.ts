import type { ChangeLogService } from "~context/domain/services/change-log.service";

declare global {
    namespace Integration.Domain.ChangeLog {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        namespace Service {
            type Context = {
                changeLogService: ChangeLogService;
            };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }

        interface Contract {
            readonly service: Service.Signature;
        }
    }
}
