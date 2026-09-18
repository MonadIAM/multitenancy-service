import { jest } from "@jest/globals";

import { EntityFactoryRegistry } from "./entity-factory.registry";

export class RepositoryMockBank extends EntityFactoryRegistry implements Unit.Domain.RepositoryMockBank.Contract {
    public repositories(
        props: Unit.Domain.RepositoryMockBank.Repositories.Props = {},
    ): Unit.Domain.RepositoryMocks.Contract {
        const organizations = props.organizations ?? [this.createOrganization()];
        const memberships = props.memberships ?? [this.createOrgMembership({ organization: organizations[0] })];
        const projects = props.projects ?? [this.createProject({ organization: organizations[0] })];
        const departments = props.departments ?? [this.createDepartment({ organization: organizations[0] })];
        const teams = props.teams ?? [
            this.createTeam({
                department: departments[0],
                organization: organizations[0],
            }),
        ];

        return {
            projectAssignments: this.baseRepository("ProjectAccountAssignment", props.projectAssignments ?? []),
            departmentAssignments: this.baseRepository("DeptAccountAssignment", props.departmentAssignments ?? []),
            teamAssignments: this.baseRepository("TeamAccountAssignment", props.teamAssignments ?? []),
            organizations: this.lookupRepository("Organization", organizations),
            memberships: this.baseRepository("OrgMembership", memberships),
            departments: this.lookupRepository("Department", departments),
            changeLogs: this.baseRepository("ChangeLog", props.changeLogs ?? []),
            auditLogs: this.baseRepository("AuditLog", props.auditLogs ?? []),
            projects: this.lookupRepository("Project", projects),
            invites: {
                ...this.baseRepository("Invite", props.invites ?? []),
                findExpiredPending: jest.fn(() => Promise.resolve([])),
            },
            teams: this.lookupRepository("Team", teams),
        };
    }

    private lookupRepository(resource: string, entities: object[]): Unit.Domain.RepositoryMocks.Lookup {
        return {
            ...this.baseRepository(resource, entities),
            getLookupList: jest.fn(),
        };
    }

    private baseRepository(resource: string, entities: object[]): Unit.Domain.RepositoryMocks.Base {
        return {
            findUniqueOrThrow: jest.fn(() => Promise.resolve(entities[0])),
            findUnique: jest.fn(() => Promise.resolve(null)),
            find: jest.fn(() => Promise.resolve(entities)),
            findMany: jest.fn(),
            resource,
        };
    }
}
