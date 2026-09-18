declare namespace Unit {
    namespace Domain {
        namespace RepositoryMockBank {
            interface Contract extends EntityFactory.Contract {
                readonly repositories: Repositories.Signature;
            }

            namespace Repositories {
                type Props = {
                    readonly projectAssignments?: Entities.ProjectAccountAssignment[];
                    readonly departmentAssignments?: Entities.DeptAccountAssignment[];
                    readonly teamAssignments?: Entities.TeamAccountAssignment[];
                    readonly memberships?: Entities.OrgMembership[];
                    readonly organizations?: Entities.Organization[];
                    readonly departments?: Entities.Department[];
                    readonly changeLogs?: SystemEntities.ChangeLog[];
                    readonly auditLogs?: SystemEntities.AuditLog[];
                    readonly projects?: Entities.Project[];
                    readonly invites?: Entities.Invite[];
                    readonly teams?: Entities.Team[];
                };

                type Signature = (props?: Props) => RepositoryMocks.Contract;
            }
        }

        namespace RepositoryMocks {
            type Base = {
                resource: string;
                findUniqueOrThrow: Mock;
                findUnique: Mock;
                findMany: Mock;
                find: Mock;
            };

            type Lookup = Base & { getLookupList: Mock };

            type Invite = Base & { findExpiredPending: Mock };

            interface Contract {
                readonly projectAssignments: Base;
                readonly departmentAssignments: Base;
                readonly teamAssignments: Base;
                readonly memberships: Base;
                readonly organizations: Lookup;
                readonly departments: Lookup;
                readonly changeLogs: Base;
                readonly auditLogs: Base;
                readonly projects: Lookup;
                readonly invites: Invite;
                readonly teams: Lookup;
            }
        }
    }
}
