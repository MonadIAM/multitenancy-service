import { ReauthenticationConsumer } from "./reauthentication.consumer";
import { AccessCacheConsumer } from "./access-cache.consumer";
import { BlacklistConsumer } from "./blacklist.consumer";
import { AccountConsumer } from "./account.consumer";
import { RealmConsumer } from "./realm.consumer";

export const CONSUMERS = [AccountConsumer, RealmConsumer, ReauthenticationConsumer, BlacklistConsumer, AccessCacheConsumer];

export { AccountConsumer, RealmConsumer, ReauthenticationConsumer, BlacklistConsumer, AccessCacheConsumer };
