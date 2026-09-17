import { EntitySchema } from "@mikro-orm/postgresql";

import { DeptAccountAssignment } from "~context/domain/entities/dept-account-assignment.entity";
import { OrgMembership } from "~context/domain/entities/org-membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Department } from "~context/domain/entities/department.entity";
import { AssignmentStatus } from "~context/enums";

export const DeptAccountAssignmentSchema = new EntitySchema<DeptAccountAssignment>({
    class: DeptAccountAssignment,
    tableName: "dept_account_assignment",
    schema: "multitenancy",

    uniques: [
        {
            name: "dept_account_assignment_membership_department_unique",
            columns: [{ name: "membership_id" }, { name: "department_id" }],
        },
        {
            name: "dept_account_assignment_id_department_unique",
            columns: [{ name: "id" }, { name: "department_id" }],
        },
    ],

    indexes: [
        {
            name: "dept_account_assignment_department_idx",
            columns: [{ name: "department_id" }],
        },
    ],

    properties: {
        id: { primary: true, type: "uuid" },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "restrict",
        },
        membership: {
            kind: "m:1",
            entity: () => OrgMembership,
            joinColumns: ["membership_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["membership_id"],
            deleteRule: "restrict",
            foreignKeyName: "dept_assignment_membership_organization_fk",
        },
        department: {
            kind: "m:1",
            entity: () => Department,
            joinColumns: ["department_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["department_id"],
            inversedBy: "assignments",
            deleteRule: "restrict",
            foreignKeyName: "dept_assignment_department_organization_fk",
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
