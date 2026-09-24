import { describe, expect, it } from "@jest/globals";

import { DepartmentIntegrationHelpers } from "~testing/integration/domain-service/department.helpers";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { Department } from "~context/domain/entities";

const helpers = new DepartmentIntegrationHelpers();

describe("DepartmentService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("creates and archives a department scoped by organization realm", async () => {
        const organization = await suite.fixtures().createOrganization();

        const department = await suite.transaction((transaction) =>
            suite.repository().departmentService.create({
                input: { organization: organization.id, name: "Created", description: "Description" },
                realm: organization.realm,
                transaction,
            }),
        );
        await suite.transaction((transaction) =>
            suite
                .repository()
                .departmentService.archive({ identifiers: [department.id], realm: organization.realm, transaction }),
        );

        const loaded = await suite.transaction((transaction) =>
            transaction.findOneOrFail(Department, { id: department.id }),
        );
        expect(loaded.status).toBe("ARCHIVED");
    });
});
