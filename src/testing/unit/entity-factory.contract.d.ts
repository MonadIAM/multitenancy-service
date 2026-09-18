declare namespace Unit {
    namespace Domain {
        namespace EntityFactory {
            interface Contract {
                readonly createProjectAccountAssignment: CreateProjectAccountAssignment.Signature;
                readonly createDeptAccountAssignment: CreateDeptAccountAssignment.Signature;
                readonly createTeamAccountAssignment: CreateTeamAccountAssignment.Signature;
                readonly createOrgMembership: CreateOrgMembership.Signature;
                readonly createOrganization: CreateOrganization.Signature;
                readonly createDepartment: CreateDepartment.Signature;
                readonly createChangeLog: CreateChangeLog.Signature;
                readonly createAuditLog: CreateAuditLog.Signature;
                readonly createProject: CreateProject.Signature;
                readonly createInvite: CreateInvite.Signature;
                readonly createTeam: CreateTeam.Signature;
            }

            namespace CreateOrganization {
                type Props = Partial<Entities.Organization.Contract>;

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
                type Props = Partial<SystemEntities.AuditLog>;

                type Result = SystemEntities.AuditLog;

                type Signature = (props?: Props) => Result;
            }

            namespace CreateChangeLog {
                type Props = Partial<SystemEntities.ChangeLog>;

                type Result = SystemEntities.ChangeLog;

                type Signature = (props?: Props) => Result;
            }
        }
    }
}
