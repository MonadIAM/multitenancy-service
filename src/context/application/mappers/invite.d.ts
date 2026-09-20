declare namespace Commands {
    namespace Mappers {
        namespace Invite {
            interface Contract {
                compensationPayload(props: {
                    access: { realm: string; account: string }[];
                    actor: string;
                }): Topics.Realm.AccountAccessMessage["payload"][];

                joinPayload(props: Commands.Mappers.Invite.Accept): Topics.Realm.MembershipJoinRequestedMessage["payload"];

                notificationPayload(
                    props: Commands.Mappers.Invite.Notification,
                ): Topics.Notification.CreateMessage["payload"];

                cancellationPayload(
                    props: Commands.Mappers.Invite.Notification,
                ): Topics.Notification.CreateMessage["payload"];
            }

            type Accept = Awaited<Services.Invite.Accept.Result>;

            type Notification = Entities.Invite;
        }
    }
}
