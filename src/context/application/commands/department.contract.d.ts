declare namespace Commands {
    namespace Department {
        interface Contract extends ControllerContract {}

        interface ControllerContract {
            unassignManager: UnassignManager.Signature;
            assignManager: AssignManager.Signature;
            archive: Archive.Signature;
            restore: Restore.Signature;
            create: Create.Signature;
            update: Update.Signature;
            purge: Purge.Signature;
        }

        namespace Create {
            type Props = {
                input: {
                    organization: string;
                    description: string;
                    name: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Update {
            type Props = {
                input: {
                    patch: Partial<Entities.Department.MutableFields>;
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
                id: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace AssignManager {
            type Props = {
                input: {
                    assignment: string;
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
                id: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace UnassignManager {
            type Props = {
                input: {
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
                id: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Archive {
            type Props = {
                input: {
                    identifiers: string[];
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Restore {
            type Props = {
                input: {
                    identifiers: string[];
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }

        namespace Purge {
            type Props = {
                input: {
                    identifiers: string[];
                    reason: string;
                };
                context: Extract.Meta;
                actor: string;
                realm: string;
            };

            type Result = Promise<MessageResult>;

            type Signature = (props: Props) => Result;
        }
    }
}
