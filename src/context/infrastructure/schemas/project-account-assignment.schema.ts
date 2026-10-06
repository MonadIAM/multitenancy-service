import { EntitySchema } from "@mikro-orm/postgresql";

import { ProjectAccountAssignment } from "~context/domain/entities/project-account-assignment.entity";
import { OrgMembership } from "~context/domain/entities/org-membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Project } from "~context/domain/entities/project.entity";
import { AssignmentStatus } from "~context/enums";

export const ProjectAccountAssignmentSchema = new EntitySchema<ProjectAccountAssignment>({
    class: ProjectAccountAssignment,
    tableName: "project_account_assignment",
    schema: "multitenancy",

    uniques: [
        {
            name: "project_account_assignment_membership_project_unique",
            properties: ["membership", "project"],
        },
        {
            name: "project_account_assignment_id_project_unique",
            properties: ["id", "project"],
        },
    ],

    indexes: [
        {
            name: "project_account_assignment_project_idx",
            properties: ["project"],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "cascade",
        },
        membership: {
            kind: "m:1",
            entity: () => OrgMembership,
            joinColumns: ["membership_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["membership_id"],
            deleteRule: "restrict",
            foreignKeyName: "project_assignment_membership_organization_fk",
        },
        project: {
            kind: "m:1",
            entity: () => Project,
            joinColumns: ["project_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["project_id"],
            inversedBy: "assignments",
            deleteRule: "cascade",
            foreignKeyName: "project_assignment_project_organization_fk",
        },
        status: {
            enum: true,
            items: () => AssignmentStatus,
            nativeEnumName: "assignment_status",
        },
        assignedBy: { type: "uuid", fieldName: "assigned_by" },
        assignedAt: { type: "timestamptz", length: 3 },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        version: { type: "int", version: true },
    },
});
