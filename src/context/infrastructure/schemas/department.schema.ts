import { EntitySchema } from "@mikro-orm/postgresql";

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
        { name: "department_manager_position_idx", properties: ["managerPosition"] },
    ],

    properties: {
        id: { primary: true, type: "uuid" },

        managerPosition: { type: "uuid", fieldName: "manager_position_id", nullable: true },
        previousPosition: { type: "uuid", nullable: true },
        process: { type: "uuid", nullable: true },

        description: { type: "text" },
        name: { type: "text" },

        status: {
            enum: true,
            items: () => DepartmentStatus,
            nativeEnumName: "department_status",
        },

        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "restrict",
        },

        archivedAt: { type: "timestamptz", length: 3, nullable: true },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        createdAt: { type: "timestamptz", length: 3 },
        version: { type: "int", version: true },
    },
});
