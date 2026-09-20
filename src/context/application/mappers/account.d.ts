declare namespace Commands {
    namespace Mappers {
        namespace Account {
            type Purge = Awaited<Services.Account.Purge.Result>;

            interface Contract {
                realmPurgePayload(props: Purge): Topics.Realm.SystemLifecycleMessage["payload"][];
                accessPurgePayload(props: Purge): Topics.Realm.AccountAccessMessage["payload"][];
            }
        }
    }
}
