import { DeferMode, EntitySchema } from "@mikro-orm/postgresql";

import { Membership } from "~context/domain/entities/membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { OrganizationStatus } from "~context/enums";

export const OrganizationSchema = new EntitySchema<Organization>({
    class: Organization,
    tableName: "organization",
    schema: "organization",

    uniques: [
        {
            name: "organization_realm_unique",
            properties: ["realm"],
        },
    ],

    indexes: [
        {
            name: "organization_title_trgm_idx",
            expression:
                'CREATE INDEX "organization_title_trgm_idx" ON "organization"."organization" USING gin ("title" gin_trgm_ops)',
        },
        {
            name: "organization_owner_idx",
            properties: ["owner"],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        realm: { type: "uuid", fieldName: "realm_id" },

        memberships: {
            kind: "1:m",
            entity: () => Membership,
            mappedBy: "organization",
        },
        owner: {
            kind: "m:1",
            entity: () => Membership,
            joinColumns: ["owner_id", "id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["owner_id"],
            deleteRule: "no action",
            deferMode: DeferMode.INITIALLY_DEFERRED,
            foreignKeyName: "organization_owner_membership_fk",
        },

        bootstrapPending: { type: "json", defaultRaw: "'[]'::jsonb" },
        pendingOwner: { type: "uuid", nullable: true },
        process: { type: "uuid", nullable: true },

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
