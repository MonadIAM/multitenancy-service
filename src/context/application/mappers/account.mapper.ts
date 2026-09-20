import { SYSTEM_ACCOUNT_ID } from "~context/constants";

export class AccountMapper implements Commands.Mappers.Account.Contract {
    public realmPurgePayload(props: Commands.Mappers.Account.Purge): Topics.Realm.SystemLifecycleMessage["payload"][] {
        return props.realms.map(({ realm }) => ({
            actor: SYSTEM_ACCOUNT_ID,
            realm,
        }));
    }

    public accessPurgePayload(props: Commands.Mappers.Account.Purge): Topics.Realm.AccountAccessMessage["payload"][] {
        return props.access.map(({ realm, account }) => ({
            actor: SYSTEM_ACCOUNT_ID,
            realm,
            input: { account },
        }));
    }
}
