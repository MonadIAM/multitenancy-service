import { DeferMode, EntitySchema } from "@mikro-orm/postgresql";

import { Membership } from "~context/domain/entities/membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { MembershipStatus } from "~context/enums";

export const MembershipSchema = new EntitySchema<Membership>({
    class: Membership,
    tableName: "membership",
    schema: "organization",

    uniques: [
        {
            name: "membership_organization_account_unique",
            properties: ["organization", "account"],
        },
        {
            name: "membership_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        {
            name: "membership_account_idx",
            properties: ["account"],
        },
        {
            name: "membership_status_idx",
            properties: ["status"],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            inversedBy: "memberships",
            deleteRule: "cascade",
            deferMode: DeferMode.INITIALLY_DEFERRED,
        },
        account: { type: "uuid", fieldName: "account_id" },
        status: {
            enum: true,
            items: () => MembershipStatus,
            nativeEnumName: "membership_status",
        },

        suspendedAt: { type: "timestamptz", length: 3, nullable: true },
        blockedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        joinedAt: { type: "timestamptz", length: 3, nullable: true },
        leftAt: { type: "timestamptz", length: 3, nullable: true },
        process: { type: "uuid", nullable: true },
        failure: { type: "text", nullable: true },
        version: { type: "int", version: true },
    },
});
