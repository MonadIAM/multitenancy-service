declare namespace Services {
    namespace Project {
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
                input: {
                    organization: string;
                    description: string;
                    realm: string;
                    name: string;
                };
            };

            type Result = Promise<Entities.Project>;

            type Signature = (props: Props) => Result;
        }

        namespace Update {
            type Props = {
                patch: Partial<Entities.Project.MutableFields>;
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
                assignment: Nullable<string>;
                realm: string;
                id: string;
            };

            type Result = Promise<Entities.Project>;

            type Signature = (props: Props) => Result;
        }

        namespace Archive {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.Project[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Restore {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.Project[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Purge {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.Project[]>;

            type Signature = (props: Props) => Result;
        }
    }
}
