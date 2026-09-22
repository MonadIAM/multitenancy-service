import { describe, expect, it } from "@jest/globals";

import { EntityFactoryRegistry } from "~testing/entity-factory.registry";

import { OrgMembershipMapper } from "./org-membership.mapper";

const helpers = new EntityFactoryRegistry();
const mapper = new OrgMembershipMapper();

describe("OrgMembershipMapper", () => {
    it("requests the default role with membership correlation", () => {
        const membership = helpers.createOrgMembership();
        membership.beginJoin();

        const payload = mapper.joinPayload({ membership, actor: "actor" });

        expect(payload.input.membership).toBe(membership.id);
        expect(payload.input.process).toBe(membership.process);
        expect(payload.input.command).toBe(membership.process);
        expect(payload.input.role).toBeUndefined();
        expect(payload.realm).toBe(membership.organization.realm);
    });

    it("preserves every account-realm target", () => {
        const membership = helpers.createOrgMembership();
        const access = ["organization-realm", "project-realm"].map((realm) => ({
            realm,
            account: membership.account,
        }));

        const payloads = mapper.accessPayload({ memberships: [membership], access, actor: "actor" });

        expect(payloads).toEqual(access.map(({ realm, ...input }) => ({ realm, actor: "actor", input })));
    });
});
