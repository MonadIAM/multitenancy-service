import { beforeAll, describe, expect, it } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";

import { REQUIRE_GLOBAL_PERMISSION, REQUIRE_PERMISSION, IS_PUBLIC } from "~common/decorators/tokens";
import { GuardUnitHelpers } from "~testing/unit/guards/guard.helpers";
import { PermissionCode, PrivilegeScope } from "~context/enums";
import { SYSTEM_REALM_ID } from "~context/constants";

/* eslint-disable prettier/prettier */
const ACCOUNT_ID = "00000000-0000-4000-8000-100000000001";
const REALM_ID   = "00000000-0000-4000-8000-100000000002";
/* eslint-enable prettier/prettier */

const PERMISSION = PermissionCode.REALM_READ_ABSOLUTE;
const SECOND_PERMISSION = PermissionCode.REALM_UPDATE;

const helpers = new GuardUnitHelpers();

beforeAll(() => helpers.initialize());

describe("PermissionGuard", () => {
    it.each(["public", "unrestricted"] as const)("allows %s handlers without permission lookups", async (scenario) => {
        const { guard, checkPermissions } = helpers.permission();
        const handlerMetadata: [symbol, unknown][] = scenario === "public" ? [[IS_PUBLIC, true]] : [];
        const context = helpers.context({ request: helpers.request(), handlerMetadata });

        const result = guard.canActivate(context);

        await expect(result).resolves.toBe(true);
        expect(checkPermissions).not.toHaveBeenCalled();
    });

    it("requires an authenticated account before looking up permissions", async () => {
        const { guard, checkPermissions } = helpers.permission();
        const context = helpers.context({
            request: helpers.request({ session: { realms: [REALM_ID] } }),
            handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]],
        });

        const result = guard.canActivate(context);

        await expect(result).rejects.toMatchObject({
            message: "guard.permission.ACCOUNT_REQUIRED",
            statusCode: HttpStatus.FORBIDDEN,
        });
        expect(checkPermissions).not.toHaveBeenCalled();
    });

    it("rejects an empty requested realm", async () => {
        const { guard, checkPermissions } = helpers.permission();
        const request = helpers.request({ query: { realm: "" }, session: { account: ACCOUNT_ID, realms: [REALM_ID] } });

        const result = guard.canActivate(
            helpers.context({ request, handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }),
        );

        await expect(result).rejects.toMatchObject({ message: "guard.permission.REALM_REQUIRED" });
        expect(checkPermissions).not.toHaveBeenCalled();
    });

    it.each([{ realms: [SYSTEM_REALM_ID] }, { realms: [REALM_ID] }, { realms: [] }])(
        "allows a global grant independently of session realms %j",
        async ({ realms }) => {
            const { guard, checkPermissions } = helpers.permission({ matched: { [PERMISSION]: PrivilegeScope.GLOBAL } });
            const request = helpers.request({ query: { realm: REALM_ID }, session: { account: ACCOUNT_ID, realms } });

            const result = guard.canActivate(
                helpers.context({ request, handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }),
            );

            await expect(result).resolves.toBe(true);
            expect(checkPermissions.mock.calls).toEqual([
                [
                    {
                        globalOnly: true,
                        permissions: [PERMISSION],
                        account: ACCOUNT_ID,
                        realm: SYSTEM_REALM_ID,
                    },
                ],
            ]);
            expect(request.metadata.permissions).toEqual({ [PERMISSION]: PrivilegeScope.GLOBAL });
        },
    );

    it("does not search realm grants outside the session scope", async () => {
        const { guard, checkPermissions } = helpers.permission();
        const request = helpers.request({
            query: { realm: REALM_ID },
            session: { account: ACCOUNT_ID, realms: [SYSTEM_REALM_ID] },
        });

        const result = guard.canActivate(
            helpers.context({ request, handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }),
        );

        await expect(result).rejects.toMatchObject({ message: "guard.permission.REALM_OUT_OF_SESSION_SCOPE" });
        expect(checkPermissions.mock.calls).toEqual([
            [
                {
                    globalOnly: true,
                    permissions: [PERMISSION],
                    account: ACCOUNT_ID,
                    realm: SYSTEM_REALM_ID,
                },
            ],
        ]);
        expect(request.metadata).toEqual({});
    });

    it("requires session realm scope when no global grant exists", async () => {
        const { guard, checkPermissions } = helpers.permission();
        const request = helpers.request({ session: { account: ACCOUNT_ID } });

        const result = guard.canActivate(
            helpers.context({ request, handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }),
        );

        await expect(result).rejects.toMatchObject({ message: "guard.permission.REALM_SCOPE_MISSING" });
        expect(checkPermissions).toHaveBeenCalledTimes(1);
    });

    it("checks only the requested realm after a global miss and a successful session scope check", async () => {
        const { guard, checkPermissions } = helpers.permission();
        checkPermissions.mockResolvedValueOnce({}).mockResolvedValueOnce({ [PERMISSION]: PrivilegeScope.REALM });
        const request = helpers.request({
            query: { realm: REALM_ID },
            session: { account: ACCOUNT_ID, realms: [SYSTEM_REALM_ID, REALM_ID] },
        });

        const result = guard.canActivate(helpers.context({ request, classMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }));

        await expect(result).resolves.toBe(true);
        expect(checkPermissions.mock.calls).toEqual([
            [{ globalOnly: true, permissions: [PERMISSION], account: ACCOUNT_ID, realm: SYSTEM_REALM_ID }],
            [{ globalOnly: false, permissions: [PERMISSION], account: ACCOUNT_ID, realm: REALM_ID }],
        ]);
        expect(request.metadata.permissions).toEqual({ [PERMISSION]: PrivilegeScope.REALM });
    });

    it("rejects when neither global nor requested realm grants match", async () => {
        const { guard, checkPermissions } = helpers.permission();
        const request = helpers.request({
            query: { realm: REALM_ID },
            session: { account: ACCOUNT_ID, realms: [REALM_ID] },
        });

        const result = guard.canActivate(
            helpers.context({ request, handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }),
        );

        await expect(result).rejects.toMatchObject({ message: "guard.permission.INSUFFICIENT_PERMISSIONS" });
        expect(checkPermissions).toHaveBeenCalledTimes(2);
    });

    it("allows manage with a global grant without requiring a direct system login", async () => {
        const { guard, checkPermissions } = helpers.permission({ matched: { [SECOND_PERMISSION]: PrivilegeScope.GLOBAL } });
        const request = helpers.request({
            query: { realm: REALM_ID },
            session: { account: ACCOUNT_ID, realms: [REALM_ID] },
        });
        const context = helpers.context({
            request,
            handlerMetadata: [
                [REQUIRE_PERMISSION, [PERMISSION]],
                [REQUIRE_GLOBAL_PERMISSION, [SECOND_PERMISSION]],
            ],
        });

        const result = guard.canActivate(context);

        await expect(result).resolves.toBe(true);
        expect(checkPermissions.mock.calls).toEqual([
            [
                {
                    globalOnly: true,
                    permissions: [SECOND_PERMISSION],
                    account: ACCOUNT_ID,
                    realm: SYSTEM_REALM_ID,
                },
            ],
        ]);
    });

    it("never falls back to realm grants for manage", async () => {
        const { guard, checkPermissions } = helpers.permission();
        checkPermissions.mockResolvedValueOnce({}).mockResolvedValue({ [PERMISSION]: PrivilegeScope.REALM });
        const request = helpers.request({ session: { account: ACCOUNT_ID, realms: [SYSTEM_REALM_ID] } });

        const result = guard.canActivate(
            helpers.context({ request, handlerMetadata: [[REQUIRE_GLOBAL_PERMISSION, [PERMISSION]]] }),
        );

        await expect(result).rejects.toMatchObject({ message: "guard.permission.INSUFFICIENT_PERMISSIONS" });
        expect(checkPermissions).toHaveBeenCalledTimes(1);
    });

    it.each(["global", "realm"])("fails closed if the %s permission lookup fails", async (stage) => {
        const { guard, checkPermissions } = helpers.permission();
        const error = new Error("permission cache unavailable");
        if (stage === "realm") {
            checkPermissions.mockResolvedValueOnce({});
        }
        checkPermissions.mockRejectedValueOnce(error);
        const request = helpers.request({
            query: { realm: REALM_ID },
            session: { account: ACCOUNT_ID, realms: [REALM_ID] },
        });

        const result = guard.canActivate(
            helpers.context({ request, handlerMetadata: [[REQUIRE_PERMISSION, [PERMISSION]]] }),
        );

        await expect(result).rejects.toBe(error);
        expect(request.metadata).toEqual({});
    });
});
