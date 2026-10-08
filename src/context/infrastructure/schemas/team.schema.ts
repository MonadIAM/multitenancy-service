import { EntitySchema } from "@mikro-orm/postgresql";

import { Organization } from "~context/domain/entities/organization.entity";
import { Department } from "~context/domain/entities/department.entity";
import { Team } from "~context/domain/entities/team.entity";
import { TeamStatus } from "~context/enums";

export const TeamSchema = new EntitySchema<Team>({
    class: Team,
    tableName: "team",
    schema: "organization",

    uniques: [
        {
            name: "team_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        {
            name: "team_name_trgm_idx",
            expression: 'CREATE INDEX "team_name_trgm_idx" ON "organization"."team" USING gin ("name" gin_trgm_ops)',
        },
        {
            name: "team_lead_position_idx",
            properties: ["leadPosition"],
        },
        {
            name: "team_organization_idx",
            properties: ["organization"],
        },
        {
            name: "team_department_idx",
            properties: ["department"],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        leadPosition: { type: "uuid", fieldName: "lead_position_id", nullable: true },
        previousPosition: { type: "uuid", nullable: true },
        process: { type: "uuid", nullable: true },

        description: { type: "text" },
        name: { type: "text" },
        status: {
            enum: true,
            items: () => TeamStatus,
            nativeEnumName: "team_status",
        },

        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "cascade",
        },
        department: {
            kind: "m:1",
            entity: () => Department,
            joinColumns: ["department_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["department_id"],
            deleteRule: "restrict",
            foreignKeyName: "team_department_organization_fk",
        },

        archivedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        version: { type: "int", version: true },
    },
});
