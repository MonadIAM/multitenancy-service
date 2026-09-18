declare namespace Services {
    namespace Organization {
        interface Contract extends CommandContract {}

        interface CommandContract {
            transferOwnership: TransferOwnership.Signature;
            restore: Restore.Signature;
            create: Create.Signature;
            update: Update.Signature;
            revoke: Revoke.Signature;
            purge: Purge.Signature;
        }

        namespace Create {
            type Props = {
                transaction: ORM.EntityManager;
                actor: string;
                input: {
                    description: string;
                    realm: string;
                    title: string;
                };
            };

            type Result = {
                membership: Entities.OrgMembership;
                organization: Entities.Organization;
            };

            type Signature = (props: Props) => Result;
        }

        namespace Update {
            type Props = {
                realm: string;
                patch: Partial<Entities.Organization.MutableFields>;
                transaction: ORM.EntityManager;
                id: string;
            };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }

        namespace TransferOwnership {
            type Props = {
                realm: string;
                transaction: ORM.EntityManager;
                membership: string;
                id: string;
            };

            type Result = Promise<Entities.Organization>;

            type Signature = (props: Props) => Result;
        }

        namespace Revoke {
            type Props = {
                realm: string;
                transaction: ORM.EntityManager;
                identifiers: string[];
            };

            type Result = Promise<Entities.Organization[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Restore {
            type Props = {
                realm: string;
                transaction: ORM.EntityManager;
                identifiers: string[];
            };

            type Result = Promise<Entities.Organization[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Purge {
            type Props = {
                realm: string;
                transaction: ORM.EntityManager;
                identifiers: string[];
            };

            type Result = Promise<Entities.Organization[]>;

            type Signature = (props: Props) => Result;
        }
    }
}
