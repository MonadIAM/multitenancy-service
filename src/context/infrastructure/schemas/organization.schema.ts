import { DeferMode, EntitySchema } from "@mikro-orm/postgresql";

import { OrgMembership } from "~context/domain/entities/org-membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { OrganizationStatus } from "~context/enums";

export const OrganizationSchema = new EntitySchema<Organization>({
    class: Organization,
    tableName: "organization",
    schema: "multitenancy",

    uniques: [{ name: "organization_realm_unique", properties: ["realm"] }],

    indexes: [
        {
            name: "organization_title_trgm_idx",
            expression:
                'CREATE INDEX "organization_title_trgm_idx" ON "multitenancy"."organization" USING gin ("title" gin_trgm_ops)',
        },
        { name: "organization_owner_idx", columns: [{ name: "owner_id" }] },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        owner: {
            kind: "m:1",
            entity: () => OrgMembership,
            joinColumns: ["owner_id", "id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["owner_id"],
            deleteRule: "restrict",
            deferMode: DeferMode.INITIALLY_DEFERRED,
            foreignKeyName: "organization_owner_membership_fk",
        },
        realm: { type: "uuid", fieldName: "realm_id" },

        title: { type: "text" },
        description: { type: "text" },
        status: {
            enum: true,
            items: () => OrganizationStatus,
            nativeEnumName: "organization_status",
        },

        revokedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        version: { type: "int", version: true },
    },
});
