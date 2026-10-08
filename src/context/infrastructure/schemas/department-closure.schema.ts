import { EntitySchema } from "@mikro-orm/postgresql";

import { DepartmentClosure, Department, Organization } from "~context/domain/entities";

export const DepartmentClosureSchema = new EntitySchema<DepartmentClosure>({
    class: DepartmentClosure,
    tableName: "department_closure",
    schema: "multitenancy",
    indexes: [
        {
            name: "department_closure_ancestor_depth_idx",
            properties: ["ancestor", "depth"],
        },
        {
            name: "department_closure_descendant_depth_idx",
            properties: ["descendant", "depth"],
        },
    ],
    checks: [
        {
            name: "department_closure_depth_check",
            expression:
                '(("ancestor_id" = "descendant_id" AND "depth" = 0) OR ("ancestor_id" <> "descendant_id" AND "depth" > 0))',
        },
    ],
    properties: {
        depth: { type: "int" },
        organization: {
            kind: "m:1",
            primary: true,
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "cascade",
        },
        ancestor: {
            kind: "m:1",
            primary: true,
            entity: () => Department,
            fieldName: "ancestor_id",
            deleteRule: "cascade",
        },
        descendant: {
            kind: "m:1",
            primary: true,
            entity: () => Department,
            fieldName: "descendant_id",
            deleteRule: "cascade",
        },
    },
});
