import { ConfigService } from "@nestjs/config";
import { jest } from "@jest/globals";

declare global {
    namespace Unit {
        namespace Domain {
            type Mock = ReturnType<typeof jest.fn>;

            namespace Core {
                interface Transaction {
                    readonly entityManager: ORM.EntityManager;
                    readonly persist: Mock;
                    readonly remove: Mock;
                    readonly flush: Mock;
                    readonly clear: Mock;
                    readonly merge: Mock;
                }

                interface Contract extends ServiceMockBank.Contract {
                    readonly transaction: TransactionFactory.Signature;
                    readonly createExample: CreateExample.Signature;
                    readonly config: Config.Signature;
                }

                namespace Service {
                    type Context<TService> = {
                        readonly repositories: RepositoryMocks.Contract;
                        readonly services: ServiceMocks.Contract;
                        readonly transaction: Transaction;
                        readonly service: TService;
                    };
                }

                namespace TransactionFactory {
                    type Result = Transaction;

                    type Signature = () => Result;
                }

                namespace Config {
                    type Props = {
                        readonly values?: Record<string, unknown>;
                    };

                    type Result = ConfigService;

                    type Signature = (props?: Props) => Result;
                }

                namespace CreateExample {
                    type Props = Partial<ORM.AnyEntity>;

                    type Result = ORM.AnyEntity;

                    type Signature = (props?: Props) => Result;
                }
            }
        }
    }
}
