declare namespace Unit.Commands.Team {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Team.Contract;
            teamService: Jest.Mocked<
                Pick<Services.Team.CommandContract, "changeLead" | "archive" | "restore" | "create" | "update" | "purge">
            >;
        };

        type Signature = () => Result;
    }
}
