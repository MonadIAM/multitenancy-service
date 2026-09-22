declare namespace Unit.Commands.TeamAccountAssignment {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.TeamAccountAssignment.Contract;
            assignmentService: Jest.Mocked<
                Pick<Services.TeamAccountAssignment.CommandContract, "restore" | "create" | "revoke" | "purge">
            >;
        };

        type Signature = () => Result;
    }
}
