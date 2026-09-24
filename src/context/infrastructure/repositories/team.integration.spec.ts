import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { TeamFixture } from "~testing/integration/repositories/team.fixture";
import { TeamStatus } from "~context/enums";

import { TeamRepository } from "./team.repository";

describe("TeamRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new TeamRepository(readManager),
        fixture: (entityManager) => new TeamFixture(entityManager),
    });

    it("maps the persisted team through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const department = await suite.fixtures().createDepartment({ organization });
        const team = await suite.fixtures().createTeam({
            description: "Mapping team description",
            name: "Mapping Team",
            department,
        });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: team.id } });

        expect(loaded).toMatchObject({
            description: "Mapping team description",
            status: TeamStatus.ACTIVE,
            createdAt: team.createdAt,
            version: team.version,
            name: "Mapping Team",
            id: team.id,
        });
        expect(loaded.organization.id).toBe(organization.id);
        expect(loaded.department.id).toBe(department.id);
    });

    it("finds teams by organization, department, name and status mapper filters", async () => {
        const { organization, department, matched } = await suite.fixtures().filterScenario();

        const [teams, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { createdAt: QueryOrder.ASC },
            filters: {
                organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                department: { operator: PublicLinkOperator.EQUAL, value: department.id },
                name: { operator: PublicStringOperator.ILIKE, value: "Alpha" },
                status: { operator: PublicStringOperator.EQUAL, value: TeamStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(teams.map(({ id }) => id)).toEqual([matched.id]);
    });

    it("uses trigram lookup scoped to organization and department", async () => {
        const scenario = await suite.fixtures().lookupSearchScenario();

        const [teams, total] = await suite.repository().getLookupList({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            organization: scenario.organization.id,
            department: scenario.department.id,
            term: scenario.term,
        });

        expect(total).toBe(2);
        expect(teams[0]?.id).toBe(scenario.exact.id);
        expect(teams.map(({ name }) => name)).toEqual(scenario.expectedNames);
    });
});
