declare namespace Unit.Domain {
    namespace RepositoryMockBank {
        interface Contract extends Testing.EntityFactory.Contract {
            repositories: Repositories.Signature;
        }

        namespace Repositories {
            type Props = {
                projectAssignments?: Entities.ProjectAccountAssignment[];
                memberships?: Entities.Membership[];
                organizations?: Entities.Organization[];
                departments?: Entities.Department[];
                changeLogs?: SystemEntities.ChangeLog[];
                auditLogs?: SystemEntities.AuditLog[];
                projects?: Entities.Project[];
                invites?: Entities.Invite[];
                teams?: Entities.Team[];
            };

            type Signature = (props?: Props) => RepositoryMocks.Contract;
        }
    }

    namespace RepositoryMocks {
        type Base = {
            resource: string;
            findUniqueOrThrow: Jest.Mock;
            findUnique: Jest.Mock;
            findMany: Jest.Mock;
            find: Jest.Mock;
        };

        type Lookup = Base & { getLookupList: Jest.Mock };

        type Invite = Base & { findExpiredPending: Jest.Mock };

        interface Contract {
            projectAssignments: Base;
            organizations: Lookup;
            departments: Lookup;
            memberships: Base;
            changeLogs: Base;
            projects: Lookup;
            auditLogs: Base;
            invites: Invite;
            teams: Lookup;
        }
    }
}
