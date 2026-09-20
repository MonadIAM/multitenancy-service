declare namespace Commands {
    namespace Account {
        interface Contract extends ConsumerContract {}

        interface ConsumerContract {
            purge: Purge.Signature;
        }

        namespace Purge {
            type Props = { account: string; incoming: TransactionManager.Service.IncomingMessage };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }
    }
}
