declare namespace Fixtures {
    namespace Core {
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
            type Props = Partial<Omit<Entities.Organization.ConstructorProps, "owner">> & {
                ownerAccount?: string;
            };

            type Result = Promise<Entities.Organization>;

            type Signature = (props?: Props) => Result;
        }

        namespace CreateOrgMembership {
            type Props = Omit<Partial<Entities.OrgMembership.ConstructorProps>, "organization"> & {
                organization: Entities.Organization;
            };

            type Result = Promise<Entities.OrgMembership>;

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
                membership: Entities.OrgMembership;
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

        namespace CreateDeptAccountAssignment {
            type Props = Omit<Partial<Entities.DeptAccountAssignment.ConstructorProps>, "membership" | "department"> & {
                membership: Entities.OrgMembership;
                department: Entities.Department;
            };

            type Result = Promise<Entities.DeptAccountAssignment>;

            type Signature = (props: Props) => Result;
        }

        namespace CreateTeam {
            type Props = Omit<Partial<Entities.Team.ConstructorProps>, "department"> & {
                department: Entities.Department;
            };

            type Result = Promise<Entities.Team>;

            type Signature = (props: Props) => Result;
        }

        namespace CreateTeamAccountAssignment {
            type Props = Omit<Partial<Entities.TeamAccountAssignment.ConstructorProps>, "membership" | "team"> & {
                membership: Entities.OrgMembership;
                team: Entities.Team;
            };

            type Result = Promise<Entities.TeamAccountAssignment>;

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
            };

            type Result = Promise<SystemEntities.ChangeLog>;

            type Signature = (props?: Props) => Result;
        }
    }
}
