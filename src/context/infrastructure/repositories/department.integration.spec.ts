import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { DepartmentFixture } from "~testing/integration/repositories/department.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { DepartmentStatus } from "~context/enums";

import { DepartmentRepository } from "./department.repository";

describe("DepartmentRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new DepartmentRepository(readManager),
        fixture: (entityManager) => new DepartmentFixture(entityManager),
    });

    it("maps the persisted department through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const department = await suite.fixtures().createDepartment({
            description: "Mapping department description",
            name: "Mapping Department",
            organization,
        });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: department.id } });

        expect(loaded).toMatchObject({
            description: "Mapping department description",
            status: DepartmentStatus.ACTIVE,
            createdAt: department.createdAt,
            version: department.version,
            name: "Mapping Department",
            id: department.id,
        });
        expect(loaded.organization.id).toBe(organization.id);
    });

    it("finds departments by organization, name and status mapper filters", async () => {
        const { organization, matched } = await suite.fixtures().filterScenario();

        const [departments, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { createdAt: QueryOrder.ASC },
            filters: {
                organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                name: { operator: PublicStringOperator.ILIKE, value: "Alpha" },
                status: { operator: PublicStringOperator.EQUAL, value: DepartmentStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(departments.map(({ id }) => id)).toEqual([matched.id]);
    });

    it("uses trigram lookup scoped to organization", async () => {
        const scenario = await suite.fixtures().lookupSearchScenario();

        const [departments, total] = await suite.repository().getLookupList({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            organization: scenario.organization.id,
            term: scenario.term,
        });

        expect(total).toBe(2);
        expect(departments[0]?.id).toBe(scenario.exact.id);
        expect(departments.map(({ name }) => name)).toEqual(scenario.expectedNames);
    });
});
