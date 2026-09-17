import { EntitySchema } from "@mikro-orm/postgresql";

import { ProjectAccountAssignment } from "~context/domain/entities/project-account-assignment.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Project } from "~context/domain/entities/project.entity";
import { ProjectStatus } from "~context/enums";

export const ProjectSchema = new EntitySchema<Project>({
    class: Project,
    tableName: "project",
    schema: "multitenancy",

    uniques: [
        { name: "project_realm_unique", properties: ["realm"] },
        {
            name: "project_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        { name: "project_organization_idx", properties: ["organization"] },
        { name: "project_manager_idx", columns: [{ name: "manager_id" }] },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "restrict",
        },
        manager: {
            kind: "m:1",
            entity: () => ProjectAccountAssignment,
            joinColumns: ["manager_id", "id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "project_id"],
            ownColumns: ["manager_id"],
            deleteRule: 'set null ("manager_id")',
            nullable: true,
            foreignKeyName: "project_manager_assignment_fk",
        },
        realm: { type: "uuid", fieldName: "realm_id" },

        description: { type: "text" },
        name: { type: "text" },
        status: {
            enum: true,
            items: () => ProjectStatus,
            nativeEnumName: "project_status",
        },

        archivedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        version: { type: "int", version: true },
    },
});
