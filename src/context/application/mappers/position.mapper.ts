export class PositionMapper implements Commands.Mappers.Position.Contract {
    public confirmed(props: Commands.Mappers.Position.Confirmed.Props): Commands.Mappers.Position.Confirmed.Result {
        return props.request;
    }

    public rejected(props: Commands.Mappers.Position.Rejected.Props): Commands.Mappers.Position.Rejected.Result {
        return {
            ...props.request,
            input: {
                ...props.request.input,
                reason: props.reason,
            },
        };
    }
}
