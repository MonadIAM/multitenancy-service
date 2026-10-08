declare namespace Unit.Commands.Department {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Department.Contract;
            departmentService: Jest.Mocked<
                Pick<
                    Services.Department.CommandContract,
                    "move" | "changeManager" | "archive" | "restore" | "create" | "update" | "purge"
                >
            >;
        };

        type Signature = () => Result;
    }
}
