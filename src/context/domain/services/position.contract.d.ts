declare namespace Services.Position {
    interface Contract extends CommandContract {}

    interface CommandContract {
        validatePlacement: ValidatePlacement.Signature;
        completeReference: CompleteReference.Signature;
        release: Release.Signature;
    }

    namespace ValidatePlacement {
        type Props = Topics.Position.PlacementRequestedMessage["payload"] & {
            transaction: ORM.EntityManager;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }

    namespace CompleteReference {
        type Props = Topics.Position.ReferenceRequestedMessage["payload"] & {
            transaction: ORM.EntityManager;
            rejected: boolean;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }

    namespace Release {
        type Props = Topics.Position.LifecycleMessage["payload"] & {
            transaction: ORM.EntityManager;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }
}
