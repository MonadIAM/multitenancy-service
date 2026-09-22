declare namespace Testing.EntityFactory {
    interface Contract {
        createProjectAccountAssignment: CreateProjectAccountAssignment.Signature;
        createDeptAccountAssignment: CreateDeptAccountAssignment.Signature;
        createTeamAccountAssignment: CreateTeamAccountAssignment.Signature;
        createOrgMembership: CreateOrgMembership.Signature;
        createOrganization: CreateOrganization.Signature;
        createDepartment: CreateDepartment.Signature;
        createChangeLog: CreateChangeLog.Signature;
        createAuditLog: CreateAuditLog.Signature;
        createProject: CreateProject.Signature;
        createInvite: CreateInvite.Signature;
        createTeam: CreateTeam.Signature;
    }

    namespace CreateOrganization {
        type Props = Partial<Entities.Organization.Contract> & {
            ownerAccount?: string;
        };

        type Result = Entities.Organization;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateOrgMembership {
        type Props = Partial<Entities.OrgMembership.Contract>;

        type Result = Entities.OrgMembership;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateProject {
        type Props = Partial<Entities.Project.Contract>;

        type Result = Entities.Project;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateDepartment {
        type Props = Partial<Entities.Department.Contract>;

        type Result = Entities.Department;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateTeam {
        type Props = Partial<Entities.Team.Contract>;

        type Result = Entities.Team;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateProjectAccountAssignment {
        type Props = Partial<Entities.ProjectAccountAssignment.Contract>;

        type Result = Entities.ProjectAccountAssignment;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateDeptAccountAssignment {
        type Props = Partial<Entities.DeptAccountAssignment.Contract>;

        type Result = Entities.DeptAccountAssignment;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateTeamAccountAssignment {
        type Props = Partial<Entities.TeamAccountAssignment.Contract>;

        type Result = Entities.TeamAccountAssignment;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateInvite {
        type Props = Partial<Entities.Invite.Contract>;

        type Result = Entities.Invite;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateAuditLog {
        type Props = Partial<SystemEntities.AuditLog> & {
            context?: Partial<SystemEntities.AuditLog.ConstructorProps["context"]>;
        };

        type Result = SystemEntities.AuditLog;

        type Signature = (props?: Props) => Result;
    }

    namespace CreateChangeLog {
        type Props = Partial<SystemEntities.ChangeLog>;

        type Result = SystemEntities.ChangeLog;

        type Signature = (props?: Props) => Result;
    }
}
