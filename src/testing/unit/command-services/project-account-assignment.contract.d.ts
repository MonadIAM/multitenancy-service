declare namespace Unit.Commands.ProjectAccountAssignment {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.ProjectAccountAssignment.Contract;
            assignmentService: Jest.Mocked<
                Pick<Services.ProjectAccountAssignment.CommandContract, "restore" | "create" | "revoke" | "purge">
            >;
        };

        type Signature = () => Result;
    }
}
