declare namespace Commands {
    namespace Mappers {
        namespace OrgMembership {
            interface Contract {
                joinPayload(
                    props: Commands.Mappers.OrgMembership.Join,
                ): Topics.Realm.MembershipJoinRequestedMessage["payload"];

                accessPayload(props: Commands.Mappers.OrgMembership.Access): Topics.Realm.AccountAccessMessage["payload"][];
            }

            type Join = { membership: Entities.OrgMembership; actor: string };

            type Access = {
                memberships: Entities.OrgMembership[];
                access: { realm: string; account: string }[];
                actor: string;
            };
        }
    }
}
