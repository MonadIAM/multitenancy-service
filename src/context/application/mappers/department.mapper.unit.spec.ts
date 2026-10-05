import { describe, expect, it } from "@jest/globals";

import { EntityFactoryRegistry } from "~testing/entity-factory.registry";
import { PositionReferenceType } from "~context/enums";

import { DepartmentMapper } from "./department.mapper";

const helpers = new EntityFactoryRegistry();
const mapper = new DepartmentMapper();
const REALM = "organization-realm";
const POSITION = "position-a";
const ACTOR = "actor-account";

describe("DepartmentMapper", () => {
    describe("referencePayload", () => {
        it("maps the current position, hierarchy and process without exposing rollback state", () => {
            const department = helpers.createDepartment();
            department.assignManager({ position: "previous-position" });
            department.completePosition(false);
            department.assignManager({ position: POSITION });

            const result = mapper.referencePayload({ department, actor: ACTOR, realm: REALM });

            expect(result).toEqual([
                {
                    actor: ACTOR,
                    realm: REALM,
                    input: {
                        type: PositionReferenceType.DEPARTMENT_MANAGER,
                        organization: department.organization.id,
                        department: department.id,
                        position: POSITION,
                        process: department.process,
                    },
                },
            ]);
            expect(department.previousPosition).toBe("previous-position");
        });

        it("does not request validation for a confirmed reference", () => {
            const department = helpers.createDepartment();
            department.assignManager({ position: POSITION });
            department.completePosition(false);

            const result = mapper.referencePayload({ department, actor: ACTOR, realm: REALM });

            expect(result).toEqual([]);
            expect(department.managerPosition).toBe(POSITION);
        });

        it("does not request validation after the reference is removed", () => {
            const department = helpers.createDepartment();
            department.assignManager({ position: POSITION });
            department.unassignManager();

            const result = mapper.referencePayload({ department, actor: ACTOR, realm: REALM });

            expect(result).toEqual([]);
        });
    });

    describe("purgePayload", () => {
        it("keeps each deleted department associated with its own organization", () => {
            const first = helpers.createDepartment();
            const second = helpers.createDepartment();

            const result = mapper.purgePayload({ departments: [first, second], actor: ACTOR, realm: REALM });

            expect(result).toEqual([
                { actor: ACTOR, realm: REALM, input: { organization: first.organization.id, department: first.id } },
                { actor: ACTOR, realm: REALM, input: { organization: second.organization.id, department: second.id } },
            ]);
        });

        it("does not emit cleanup events when no entities were removed", () => {
            const departments: Entities.Department[] = [];

            const result = mapper.purgePayload({ departments, actor: ACTOR, realm: REALM });

            expect(result).toEqual([]);
        });
    });
});
