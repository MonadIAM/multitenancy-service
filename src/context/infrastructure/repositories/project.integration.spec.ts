import { describe, expect, it } from "@jest/globals";
import { QueryOrder } from "@mikro-orm/postgresql";

import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";
import { ProjectFixture } from "~testing/integration/repositories/project.fixture";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { ProjectStatus } from "~context/enums";

import { ProjectRepository } from "./project.repository";

describe("ProjectRepository", () => {
    const suite = postgresSuite({
        repository: ({ readManager }) => new ProjectRepository(readManager),
        fixture: (entityManager) => new ProjectFixture(entityManager),
    });

    it("maps the persisted project through the schema", async () => {
        const organization = await suite.fixtures().createOrganization();
        const project = await suite.fixtures().createProject({
            description: "Mapping project description",
            name: "Mapping Project",
            organization,
        });

        const loaded = await suite.repository().findUniqueOrThrow({ where: { id: project.id } });

        expect(loaded).toMatchObject({
            description: "Mapping project description",
            status: ProjectStatus.ACTIVE,
            createdAt: project.createdAt,
            version: project.version,
            name: "Mapping Project",
            realm: project.realm,
            id: project.id,
        });
        expect(loaded.organization.id).toBe(organization.id);
    });

    it("finds projects by organization, name and status mapper filters", async () => {
        const { organization, matched } = await suite.fixtures().filterScenario();

        const [projects, total] = await suite.repository().findMany({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            sort: { createdAt: QueryOrder.ASC },
            filters: {
                organization: { operator: PublicLinkOperator.EQUAL, value: organization.id },
                name: { operator: PublicStringOperator.ILIKE, value: "Alpha" },
                status: { operator: PublicStringOperator.EQUAL, value: ProjectStatus.ACTIVE },
            },
        });

        expect(total).toBe(1);
        expect(projects.map(({ id }) => id)).toEqual([matched.id]);
    });

    it("uses trigram lookup scoped to organization", async () => {
        const scenario = await suite.fixtures().lookupSearchScenario();

        const [projects, total] = await suite.repository().getLookupList({
            pagination: { currentPage: 1, elementsPerPage: 10 },
            organization: scenario.organization.id,
            term: scenario.term,
        });

        expect(total).toBe(2);
        expect(projects[0]?.id).toBe(scenario.exact.id);
        expect(projects.map(({ name }) => name)).toEqual(scenario.expectedNames);
    });
});
