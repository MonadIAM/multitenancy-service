import { PositionReferenceType } from "~context/enums";

export class TeamMapper implements Commands.Mappers.Team.Contract {
    public referencePayload(
        props: Commands.Mappers.Team.ReferencePayload.Props,
    ): Commands.Mappers.Team.ReferencePayload.Result {
        const { team, actor, realm } = props;

        if (team.process) {
            return [
                {
                    actor,
                    realm,
                    input: {
                        type: PositionReferenceType.TEAM_LEAD,
                        organization: team.organization.id,
                        department: team.department.id,
                        position: team.leadPosition!,
                        process: team.process,
                        team: team.id,
                    },
                },
            ];
        } else {
            return [];
        }
    }

    public purgePayload(props: Commands.Mappers.Team.PurgePayload.Props): Commands.Mappers.Team.PurgePayload.Result {
        return props.teams.map((team) => ({
            actor: props.actor,
            realm: props.realm,
            input: {
                organization: team.organization.id,
                team: team.id,
            },
        }));
    }
}
