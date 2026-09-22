declare namespace Unit.Commands.Invite {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Invite.Contract;
            inviteRepository: {
                findExpiredPending: Jest.Mock<Repositories.Invite.Contract["findExpiredPending"]>;
            };
            inviteService: Jest.Mocked<
                Pick<
                    Services.Invite.CommandContract,
                    "confirmJoin" | "invalidate" | "rejectJoin" | "decline" | "create" | "accept" | "cancel" | "expire"
                >
            >;
        };

        type Signature = () => Result;
    }
}
