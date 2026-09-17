import { EntitySchema } from "@mikro-orm/postgresql";

import { DeptAccountAssignment } from "~context/domain/entities/dept-account-assignment.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Department } from "~context/domain/entities/department.entity";
import { DepartmentStatus } from "~context/enums";

export const DepartmentSchema = new EntitySchema<Department>({
    class: Department,
    tableName: "department",
    schema: "multitenancy",

    uniques: [
        {
            name: "department_id_organization_unique",
            properties: ["id", "organization"],
        },
    ],

    indexes: [
        {
            name: "department_name_trgm_idx",
            expression:
                'CREATE INDEX "department_name_trgm_idx" ON "multitenancy"."department" USING gin ("name" gin_trgm_ops)',
        },
        { name: "department_organization_idx", properties: ["organization"] },
        { name: "department_manager_idx", columns: [{ name: "manager_id" }] },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        assignments: {
            kind: "1:m",
            entity: () => DeptAccountAssignment,
            mappedBy: "department",
        },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "restrict",
        },
        manager: {
            kind: "m:1",
            entity: () => DeptAccountAssignment,
            joinColumns: ["manager_id", "id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "department_id"],
            ownColumns: ["manager_id"],
            deleteRule: 'set null ("manager_id")',
            nullable: true,
            foreignKeyName: "department_manager_assignment_fk",
        },

        description: { type: "text" },
        name: { type: "text" },
        status: {
            enum: true,
            items: () => DepartmentStatus,
            nativeEnumName: "department_status",
        },

        archivedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        version: { type: "int", version: true },
    },
});
