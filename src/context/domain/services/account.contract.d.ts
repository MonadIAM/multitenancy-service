declare namespace Services {
    namespace Account {
        interface Contract extends ConsumerContract {}

        interface ConsumerContract {
            purge: Purge.Signature;
        }

        namespace Purge {
            type Props = { account: string; transaction: ORM.EntityManager };

            type Result = Promise<{
                realms: { realm: string }[];
                access: { realm: string; account: string }[];
            }>;

            type Signature = (props: Props) => Result;
        }
    }
}
