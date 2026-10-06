import { EntitySchema } from "@mikro-orm/postgresql";

import { Organization } from "~context/domain/entities/organization.entity";
import { Invite } from "~context/domain/entities/invite.entity";
import { InviteStatus } from "~context/enums";

export const InviteSchema = new EntitySchema<Invite>({
    class: Invite,
    tableName: "invite",
    schema: "multitenancy",

    uniques: [
        {
            name: "invite_pending_invitee_organization_unique",
            properties: ["invitee", "organization"],
            where: "status in ('PENDING', 'ACCEPTING')",
        },
    ],

    indexes: [
        {
            name: "invite_inviter_idx",
            properties: ["inviter"],
        },
        {
            name: "invite_status_expires_at_idx",
            properties: ["status", "expiresAt"],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        status: {
            enum: true,
            items: () => InviteStatus,
            nativeEnumName: "invite_status",
        },
        invitee: { type: "uuid", fieldName: "invitee_id" },
        inviter: { type: "uuid", fieldName: "inviter_id" },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "cascade",
        },
        role: { type: "uuid", fieldName: "role_id", nullable: true },

        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        expiresAt: { type: "timestamptz", length: 3, nullable: true },
        process: { type: "uuid", nullable: true },
        failure: { type: "text", nullable: true },
        version: { type: "int", version: true },
    },
});
