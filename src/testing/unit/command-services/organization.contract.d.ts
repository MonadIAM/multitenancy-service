declare namespace Unit.Commands.Organization {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Organization.Contract;
            organizationService: Jest.Mocked<
                Pick<
                    Services.Organization.CommandContract,
                    | "confirmBootstrap"
                    | "rejectBootstrap"
                    | "confirmTransfer"
                    | "rejectTransfer"
                    | "restore"
                    | "create"
                    | "update"
                    | "revoke"
                    | "purge"
                    | "transferOwnership"
                >
            >;
        };

        type Signature = () => Result;
    }
}
