declare namespace Services {
    namespace Department {
        interface Contract extends CommandContract {}

        interface CommandContract {
            changeManager: ChangeManager.Signature;
            archive: Archive.Signature;
            restore: Restore.Signature;
            create: Create.Signature;
            update: Update.Signature;
            purge: Purge.Signature;
        }

        namespace Create {
            type Props = {
                transaction: ORM.EntityManager;
                realm: string;
                input: {
                    organization: string;
                    description: string;
                    name: string;
                };
            };

            type Result = Promise<Entities.Department>;

            type Signature = (props: Props) => Result;
        }

        namespace Update {
            type Props = {
                patch: Partial<Entities.Department.MutableFields>;
                transaction: ORM.EntityManager;
                realm: string;
                id: string;
            };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }

        namespace ChangeManager {
            type Props = {
                transaction: ORM.EntityManager;
                position: Nullable<string>;
                realm: string;
                id: string;
            };

            type Result = Promise<Entities.Department>;

            type Signature = (props: Props) => Result;
        }

        namespace Archive {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.Department[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Restore {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.Department[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Purge {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.Department[]>;

            type Signature = (props: Props) => Result;
        }
    }
}
