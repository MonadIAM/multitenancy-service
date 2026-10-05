declare namespace Commands.Position {
    interface Contract extends ConsumerContract {}

    interface ConsumerContract {
        validatePlacement: ValidatePlacement.Signature;
        completeReference: CompleteReference.Signature;
        rejectPlacement: RejectPlacement.Signature;
        release: Release.Signature;
    }

    namespace ValidatePlacement {
        type Props = Topics.Position.PlacementRequestedMessage["payload"] & {
            incoming: TransactionManager.Service.IncomingMessage;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }

    namespace RejectPlacement {
        type Props = {
            request: Topics.Position.PlacementRequestedMessage["payload"];
            incoming: TransactionManager.Service.IncomingMessage;
            reason: string;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }

    namespace CompleteReference {
        type Props = Topics.Position.ReferenceRequestedMessage["payload"] & {
            incoming: TransactionManager.Service.IncomingMessage;
            rejected: boolean;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }

    namespace Release {
        type Props = Topics.Position.LifecycleMessage["payload"] & {
            incoming: TransactionManager.Service.IncomingMessage;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }
}
