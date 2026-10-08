import { EntitySchema } from "@mikro-orm/postgresql";

import { ProjectAccountAssignment } from "~context/domain/entities/project-account-assignment.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Project } from "~context/domain/entities/project.entity";
import { ProjectStatus } from "~context/enums";

export const ProjectSchema = new EntitySchema<Project>({
    class: Project,
    tableName: "project",
    schema: "organization",

    uniques: [
        {
            name: "project_realm_unique",
            properties: ["realm"],
        },
        {
            name: "project_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        {
            name: "project_name_trgm_idx",
            expression: 'CREATE INDEX "project_name_trgm_idx" ON "organization"."project" USING gin ("name" gin_trgm_ops)',
        },
        {
            name: "project_organization_idx",
            properties: ["organization"],
        },
        {
            name: "project_manager_idx",
            properties: ["manager"],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        assignments: {
            kind: "1:m",
            entity: () => ProjectAccountAssignment,
            mappedBy: "project",
        },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "cascade",
        },
        manager: {
            kind: "m:1",
            entity: () => ProjectAccountAssignment,
            joinColumns: ["manager_id", "id", "organization_id"],
            columnTypes: ["uuid", "uuid", "uuid"],
            referencedColumnNames: ["id", "project_id", "organization_id"],
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
        process: { type: "uuid", nullable: true },
        failure: { type: "text", nullable: true },
        version: { type: "int", version: true },
    },
});
