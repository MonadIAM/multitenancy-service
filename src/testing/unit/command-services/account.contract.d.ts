declare namespace Unit.Commands.Account {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.Account.Contract;
            accountService: Jest.Mocked<Pick<Services.Account.ConsumerContract, "purge">>;
        };

        type Signature = () => Result;
    }
}
