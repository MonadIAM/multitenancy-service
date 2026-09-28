import { describe, expect, it } from "@jest/globals";

import { SYSTEM_ACCOUNT_ID } from "~context/constants";

import { AccountMapper } from "./account.mapper";

const mapper = new AccountMapper();

describe("AccountMapper", () => {
    describe("realmPurgePayload / accessPurgePayload", () => {
        it("separates owned realm purge from account access purge in foreign realms", () => {
            const result = {
                realms: [{ realm: "owned" }],
                access: [{ realm: "foreign", account: "account" }],
            };

            const realms = mapper.realmPurgePayload(result);
            const access = mapper.accessPurgePayload(result);

            expect(realms).toEqual([{ actor: SYSTEM_ACCOUNT_ID, realm: "owned" }]);
            expect(access).toEqual([
                {
                    actor: SYSTEM_ACCOUNT_ID,
                    realm: "foreign",
                    input: { account: "account" },
                },
            ]);
        });
    });
});
