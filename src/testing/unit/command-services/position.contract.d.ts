declare namespace Unit.Commands.Position {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Position.Contract;
            positionService: Jest.Mocked<Services.Position.CommandContract>;
        };

        type Signature = () => Result;
    }
}
