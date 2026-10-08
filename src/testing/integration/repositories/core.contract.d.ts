declare namespace Fixtures.Core {
    interface Contract {
        createProjectAccountAssignment: CreateProjectAccountAssignment.Signature;
        createMembership: CreateMembership.Signature;
        createOrganization: CreateOrganization.Signature;
        createDepartment: CreateDepartment.Signature;
        createChangeLog: CreateChangeLog.Signature;
        createAuditLog: CreateAuditLog.Signature;
        createProject: CreateProject.Signature;
        createInvite: CreateInvite.Signature;
        createTeam: CreateTeam.Signature;
    }

    namespace CreateOrganization {
        type Props = Partial<Omit<Entities.Organization.ConstructorProps, "owner">> & {
            ownerAccount?: string;
        };

        type Result = Promise<Entities.Organization>;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateMembership {
        type Props = Omit<Partial<Entities.Membership.ConstructorProps>, "organization"> & {
            organization: Entities.Organization;
        };

        type Result = Promise<Entities.Membership>;

        type Signature = (props: Props) => Result;
    }

    namespace CreateInvite {
        type Props = Omit<Partial<Entities.Invite.ConstructorProps>, "organization"> & {
            organization: Entities.Organization;
        };

        type Result = Promise<Entities.Invite>;

        type Signature = (props: Props) => Result;
    }

    namespace CreateProject {
        type Props = Omit<Partial<Entities.Project.ConstructorProps>, "organization"> & {
            organization: Entities.Organization;
        };

        type Result = Promise<Entities.Project>;

        type Signature = (props: Props) => Result;
    }

    namespace CreateProjectAccountAssignment {
        type Props = Omit<Partial<Entities.ProjectAccountAssignment.ConstructorProps>, "membership" | "project"> & {
            membership: Entities.Membership;
            project: Entities.Project;
        };

        type Result = Promise<Entities.ProjectAccountAssignment>;

        type Signature = (props: Props) => Result;
    }

    namespace CreateDepartment {
        type Props = Omit<Partial<Entities.Department.ConstructorProps>, "organization"> & {
            organization: Entities.Organization;
        };

        type Result = Promise<Entities.Department>;

        type Signature = (props: Props) => Result;
    }

    namespace CreateTeam {
        type Props = Omit<Partial<Entities.Team.ConstructorProps>, "department"> & {
            department: Entities.Department;
        };

        type Result = Promise<Entities.Team>;

        type Signature = (props: Props) => Result;
    }

    namespace CreateAuditLog {
        type Props = Omit<Partial<SystemEntities.AuditLog.ConstructorProps>, "context"> & {
            context?: Partial<Extract.Meta>;
            createdAt?: Date;
        };

        type Result = Promise<SystemEntities.AuditLog>;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateChangeLog {
        type Props = Omit<Partial<SystemEntities.ChangeLog.ConstructorProps>, "auditEntry"> & {
            auditEntry?: SystemEntities.AuditLog;
            createdAt?: Date;
        };

        type Result = Promise<SystemEntities.ChangeLog>;

        type Signature = (props?: Props) => Result;
    }
}
