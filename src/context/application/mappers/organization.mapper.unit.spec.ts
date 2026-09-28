import { describe, expect, it } from "@jest/globals";

import { EntityFactoryRegistry } from "~testing/entity-factory.registry";

import { OrganizationMapper } from "./organization.mapper";

const helpers = new EntityFactoryRegistry();
const mapper = new OrganizationMapper();

describe("OrganizationMapper", () => {
    describe("bootstrapPayload", () => {
        it("maps bootstrap correlation and the owner's account", () => {
            const organization = helpers.createOrganization();
            const membership = organization.owner;
            organization.beginBootstrap();

            const payload = mapper.bootstrapPayload({ organization, membership });

            expect(payload.realm).toBe(organization.realm);
            expect(payload.actor).toBe(membership.account);
            expect(payload.input).toEqual({
                resource: organization.id,
                process: organization.process,
                owner: membership.account,
                name: organization.title,
                description: organization.description,
            });
        });
    });

    describe("lifecyclePayload", () => {
        it("maps every affected realm", () => {
            const organization = helpers.createOrganization();
            const realms = [organization.realm, "project-realm"].map((realm) => ({
                realm,
            }));

            const payloads = mapper.lifecyclePayload({ organizations: [organization], realms, actor: "actor" });

            expect(payloads).toEqual(realms.map(({ realm }) => ({ realm, actor: "actor" })));
        });
    });
});
