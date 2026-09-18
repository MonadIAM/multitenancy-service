declare namespace Commands {
    namespace Organization {
        interface Contract extends ControllerContract {}

        interface ControllerContract {
            transferOwnership: TransferOwnership.Signature;
            restore: Restore.Signature;
            create: Create.Signature;
            update: Update.Signature;
            revoke: Revoke.Signature;
            purge: Purge.Signature;
        }

        namespace Create {
            type Props = {
                input: {
                    description: string;
                    realm: string;
                    title: string;
                };
                context: Extract.Meta;
                actor: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Update {
            type Props = {
                realm: string;
                input: {
                    patch: Partial<Entities.Organization.MutableFields>;
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                id: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace TransferOwnership {
            type Props = {
                realm: string;
                input: {
                    membership: string;
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                id: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Revoke {
            type Props = {
                realm: string;
                input: {
                    identifiers: string[];
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Restore {
            type Props = {
                realm: string;
                input: {
                    identifiers: string[];
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Purge {
            type Props = {
                realm: string;
                input: {
                    identifiers: string[];
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }
    }
}
