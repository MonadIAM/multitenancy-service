export class OrgMembershipMapper implements Commands.Mappers.OrgMembership.Contract {
    public joinPayload(props: Commands.Mappers.OrgMembership.Join): Topics.Realm.MembershipJoinRequestedMessage["payload"] {
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

    public accessPayload(props: Commands.Mappers.OrgMembership.Access): Topics.Realm.AccountAccessMessage["payload"][] {
        return props.access.map(({ realm, account }) => ({
            actor: props.actor,
            realm,
            input: { account },
        }));
    }
}
