import type { AccountService } from "~context/domain/services/account.service";

declare global {
    namespace Integration.Domain.Account {
        type Suite = Postgres.Suite.Contract<Service.Context, Fixtures.Core.Contract>;

        interface Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Context = { accountService: AccountService };

            type Signature = (context: Postgres.Suite.FactoryContext) => Context;
        }
    }
}
