import { describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

import { AccountIntegrationHelpers } from "~testing/integration/domain-service/account.helpers";
import { postgresSuite } from "~testing/integration/containers/postgres.suite";
import { CoreFixture } from "~testing/integration/repositories/core.fixture";
import {
    ProjectAccountAssignment,
    DeptAccountAssignment,
    TeamAccountAssignment,
    OrgMembership,
    Organization,
    Department,
    Project,
    Invite,
    Team,
} from "~context/domain/entities";

const helpers = new AccountIntegrationHelpers();

describe("AccountService integration", () => {
    const suite = postgresSuite({
        repository: (context) => helpers.service(context),
        fixture: (manager) => new CoreFixture(manager),
    });

    it("purges owned organization graphs and only the account's links in foreign organizations", async () => {
        const account = randomUUID();
        const owned = await suite.fixtures().createOrganization({ ownerAccount: account });
        const foreign = await suite.fixtures().createOrganization();
        const project = await suite.fixtures().createProject({ organization: owned });
        const department = await suite.fixtures().createDepartment({ organization: owned });
        const team = await suite.fixtures().createTeam({ department });
        await suite.fixtures().createInvite({ organization: owned });
        const projectAssignment = await suite
            .fixtures()
            .createProjectAccountAssignment({ membership: owned.owner, project });
        const departmentAssignment = await suite
            .fixtures()
            .createDeptAccountAssignment({ membership: owned.owner, department });
        const teamAssignment = await suite.fixtures().createTeamAccountAssignment({ membership: owned.owner, team });
        await suite.transaction(async (transaction) => {
            await Promise.all([
                transaction.nativeUpdate(Project, project.id, { manager: projectAssignment.id }),
                transaction.nativeUpdate(Department, department.id, { manager: departmentAssignment.id }),
                transaction.nativeUpdate(Team, team.id, { lead: teamAssignment.id }),
            ]);
        });
        const membership = await suite.fixtures().createOrgMembership({ organization: foreign, account });
        const foreignProject = await suite.fixtures().createProject({ organization: foreign });
        const unrelatedProject = await suite.fixtures().createProject({ organization: foreign });
        await suite.fixtures().createProjectAccountAssignment({ membership, project: foreignProject });
        await suite.fixtures().createInvite({ organization: foreign, inviter: account });
        const untouchedInvite = await suite.fixtures().createInvite({ organization: foreign });

        const result = await suite.transaction((transaction) =>
            suite.repository().accountService.purge({ account, transaction }),
        );

        expect(result.realms.map(({ realm }) => realm).sort()).toEqual([owned.realm, project.realm].sort());
        expect(result.access.map(({ realm }) => realm).sort()).toEqual(
            [foreign.realm, foreignProject.realm, unrelatedProject.realm].sort(),
        );
        await expect(
            suite.transaction((transaction) =>
                Promise.all([
                    transaction.count(Organization, { id: owned.id }),
                    transaction.count(OrgMembership, { organization: owned.id }),
                    transaction.count(Project, { organization: owned.id }),
                    transaction.count(Department, { organization: owned.id }),
                    transaction.count(Team, { organization: owned.id }),
                    transaction.count(Invite, { organization: owned.id }),
                    transaction.count(ProjectAccountAssignment, { organization: owned.id }),
                    transaction.count(DeptAccountAssignment, { organization: owned.id }),
                    transaction.count(TeamAccountAssignment, { organization: owned.id }),
                    transaction.count(OrgMembership, { account }),
                    transaction.count(ProjectAccountAssignment, { membership: { id: membership.id } }),
                ]),
            ),
        ).resolves.toEqual(Array(11).fill(0));
        await expect(suite.transaction((transaction) => transaction.count(Organization, { id: foreign.id }))).resolves.toBe(
            1,
        );
        await expect(
            suite.transaction((transaction) => transaction.count(Invite, { id: untouchedInvite.id })),
        ).resolves.toBe(1);
    });

    it("rejects cleanup while ownership is being transferred to the account", async () => {
        const account = randomUUID();
        const organization = await suite.fixtures().createOrganization();
        const membership = await suite.fixtures().createOrgMembership({ organization, account });
        await suite.transaction(async (transaction) => {
            const entity = await transaction.findOneOrFail(Organization, organization.id);
            const candidate = await transaction.findOneOrFail(OrgMembership, membership.id);
            entity.beginTransfer(candidate);
        });

        await expect(
            suite.transaction((transaction) => suite.repository().accountService.purge({ account, transaction })),
        ).rejects.toThrow("services.account.TRANSFER_PENDING");

        await expect(
            suite.transaction((transaction) => transaction.count(OrgMembership, { id: membership.id })),
        ).resolves.toBe(1);
        await expect(
            suite.transaction((transaction) => transaction.count(Organization, { id: organization.id })),
        ).resolves.toBe(1);
    });

    it("rejects cleanup during a project bootstrap without deleting owned data", async () => {
        const account = randomUUID();
        const organization = await suite.fixtures().createOrganization({ ownerAccount: account });
        const project = await suite.fixtures().createProject({ organization });
        await suite.transaction(async (transaction) => {
            const entity = await transaction.findOneOrFail(Project, project.id);
            entity.beginBootstrap();
        });

        await expect(
            suite.transaction((transaction) => suite.repository().accountService.purge({ account, transaction })),
        ).rejects.toThrow("services.workflow.OPERATION_CONFLICT");

        await expect(
            suite.transaction((transaction) =>
                Promise.all([
                    transaction.count(Organization, { id: organization.id }),
                    transaction.count(Project, { id: project.id }),
                ]),
            ),
        ).resolves.toEqual([1, 1]);
    });
});
