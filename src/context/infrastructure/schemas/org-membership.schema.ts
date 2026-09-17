import { DeferMode, EntitySchema } from "@mikro-orm/postgresql";

import { OrgMembership } from "~context/domain/entities/org-membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { OrgMembershipStatus } from "~context/enums";

export const OrgMembershipSchema = new EntitySchema<OrgMembership>({
    class: OrgMembership,
    tableName: "org_membership",
    schema: "multitenancy",

    uniques: [
        {
            name: "org_membership_organization_account_unique",
            properties: ["organization", "account"],
        },
        {
            name: "org_membership_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        { name: "org_membership_account_idx", properties: ["account"] },
        { name: "org_membership_status_idx", properties: ["status"] },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            inversedBy: "memberships",
            deleteRule: "restrict",
            deferMode: DeferMode.INITIALLY_DEFERRED,
        },
        account: { type: "uuid", fieldName: "account_id" },
        status: {
            enum: true,
            items: () => OrgMembershipStatus,
            nativeEnumName: "org_membership_status",
        },

        suspendedAt: { type: "timestamptz", length: 3, nullable: true },
        blockedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        joinedAt: { type: "timestamptz", length: 3, nullable: true },
        leftAt: { type: "timestamptz", length: 3, nullable: true },
        version: { type: "int", version: true },
    },
});
