declare namespace Unit.Commands.Project {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Project.Contract;
            projectService: Jest.Mocked<
                Pick<
                    Services.Project.CommandContract,
                    | "confirmBootstrap"
                    | "rejectBootstrap"
                    | "changeManager"
                    | "archive"
                    | "restore"
                    | "create"
                    | "update"
                    | "purge"
                >
            >;
        };

        type Signature = () => Result;
    }
}
