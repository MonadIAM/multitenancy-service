import { describe, it, expect } from "@jest/globals";

import { DepartmentClosure } from "./department-closure.entity";
import { Organization } from "./organization.entity";
import { Department } from "./department.entity";

describe("DepartmentClosure Entity", () => {
    describe("constructor", () => {
        it("should assign all fields", () => {
            const ancestor = {} as Department;
            const descendant = {} as Department;
            const organization = {} as Organization;

            const closure = new DepartmentClosure({ depth: 3, ancestor, descendant, organization });

            expect(closure.depth).toBe(3);
            expect(closure.ancestor).toBe(ancestor);
            expect(closure.descendant).toBe(descendant);
            expect(closure.organization).toBe(organization);
        });
    });
});
