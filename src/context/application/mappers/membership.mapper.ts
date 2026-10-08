export class MembershipMapper implements Commands.Mappers.Membership.Contract {
    public joinPayload(props: Commands.Mappers.Membership.Join): Topics.Realm.MembershipJoinRequestedMessage["payload"] {
        const { membership, actor } = props;

        return {
            actor,
            realm: membership.organization.realm,
            input: {
                process: membership.process!,
                command: membership.process!,
                membership: membership.id,
                account: membership.account,
            },
        };
    }

    public accessPayload(props: Commands.Mappers.Membership.Access): Topics.Realm.AccountAccessMessage["payload"][] {
        return props.access.map(({ realm, account }) => ({
            actor: props.actor,
            realm,
            input: { account },
        }));
    }
}
