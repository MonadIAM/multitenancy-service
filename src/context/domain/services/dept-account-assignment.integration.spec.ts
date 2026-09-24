import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { DeptAccountAssignmentIntegrationHelpers } from "~testing/integration/domain-service/dept-account-assignment.helpers";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import { DeptAccountAssignment } from "~context/domain/entities";

const helpers = new DeptAccountAssignmentIntegrationHelpers();

describe("DeptAccountAssignmentService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("creates and then cleans an assignment by membership", async () => {
        const organization = await suite.fixtures().createOrganization();
        const membership = await suite.fixtures().createOrgMembership({ organization });
        const department = await suite.fixtures().createDepartment({ organization });

        const assignment = await suite.transaction((transaction) =>
            suite.repository().assignmentService.create({
                input: { membership: membership.id, department: department.id },
                actor: randomUUID(),
                realm: organization.realm,
                transaction,
            }),
        );
        await suite.transaction((transaction) =>
            suite.repository().assignmentService.clean({ memberships: [membership.id], transaction }),
        );

        await expect(
            suite.transaction((transaction) => transaction.count(DeptAccountAssignment, { id: assignment.id })),
        ).resolves.toBe(0);
    });
});
