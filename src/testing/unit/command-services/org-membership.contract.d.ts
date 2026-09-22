declare namespace Unit.Commands.OrgMembership {
    interface Contract extends Core.Contract {
        commands: Commands.Signature;
    }

    namespace Commands {
        type Result = Core.Execution.Result & {
            commands: globalThis.Commands.OrgMembership.Contract;
            membershipService: Jest.Mocked<
                Pick<Services.OrgMembership.CommandContract, "suspend" | "resume" | "leave" | "block" | "join">
            >;
        };

        type Signature = () => Result;
    }
}
