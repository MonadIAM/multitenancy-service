import { EntitySchema } from "@mikro-orm/postgresql";

import { TeamAccountAssignment } from "~context/domain/entities/team-account-assignment.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Department } from "~context/domain/entities/department.entity";
import { Team } from "~context/domain/entities/team.entity";
import { TeamStatus } from "~context/enums";

export const TeamSchema = new EntitySchema<Team>({
    class: Team,
    tableName: "team",
    schema: "multitenancy",

    uniques: [
        {
            name: "team_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        {
            name: "team_name_trgm_idx",
            expression: 'CREATE INDEX "team_name_trgm_idx" ON "multitenancy"."team" USING gin ("name" gin_trgm_ops)',
        },
        { name: "team_organization_idx", properties: ["organization"] },
        { name: "team_department_idx", properties: ["department"] },
        { name: "team_lead_idx", columns: [{ name: "lead_id" }] },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        assignments: {
            kind: "1:m",
            entity: () => TeamAccountAssignment,
            mappedBy: "team",
        },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "restrict",
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
        lead: {
            kind: "m:1",
            entity: () => TeamAccountAssignment,
            joinColumns: ["lead_id", "id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "team_id"],
            ownColumns: ["lead_id"],
            deleteRule: 'set null ("lead_id")',
            nullable: true,
            foreignKeyName: "team_lead_assignment_fk",
        },

        description: { type: "text" },
        name: { type: "text" },
        status: {
            enum: true,
            items: () => TeamStatus,
            nativeEnumName: "team_status",
        },

        archivedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        version: { type: "int", version: true },
    },
});
