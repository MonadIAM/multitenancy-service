declare namespace Unit.Commands.DeptAccountAssignment {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.DeptAccountAssignment.Contract;
            assignmentService: Jest.Mocked<
                Pick<Services.DeptAccountAssignment.CommandContract, "restore" | "create" | "revoke" | "purge">
            >;
        };

        type Signature = () => Result;
    }
}
