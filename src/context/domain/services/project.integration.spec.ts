import { describe, expect, it } from "@jest/globals";

import { ProjectIntegrationHelpers } from "~testing/integration/domain-service/project.helpers";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { postgresSuite } from "~testing/integration/postgres.suite";
import { Project } from "~context/domain/entities";

const helpers = new ProjectIntegrationHelpers();

describe("ProjectService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("creates and archives a project within its organization realm", async () => {
        const organization = await suite.fixtures().createOrganization();

        const project = await suite.transaction((transaction) =>
            suite.repository().projectService.create({
                input: {
                    organization: organization.id,
                    realm: organization.realm,
                    name: "Created",
                    description: "Description",
                },
                transaction,
            }),
        );
        await suite.transaction((transaction) =>
            suite
                .repository()
                .projectService.archive({ identifiers: [project.id], realm: organization.realm, transaction }),
        );

        const loaded = await suite.transaction((transaction) => transaction.findOneOrFail(Project, { id: project.id }));
        expect(loaded.status).toBe("ARCHIVED");
    });
});
