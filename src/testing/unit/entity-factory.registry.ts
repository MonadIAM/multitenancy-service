import { ChangeSetType } from "@mikro-orm/core";

import { AuditLog, ChangeLog } from "~common/transaction-manager/entities";
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

const REALM_ID = "00000000-0000-4000-8000-000000000001";
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000002";
const ACTOR_ID = "00000000-0000-4000-8000-000000000003";
const ROLE_ID = "00000000-0000-4000-8000-000000000004";

export class EntityFactoryRegistry implements Unit.Domain.EntityFactory.Contract {
    public createOrganization(props: Unit.Domain.EntityFactory.CreateOrganization.Props = {}): Entities.Organization {
        const organization = this.entity(
            new Organization({
                realm: REALM_ID,
                title: "Unit Organization",
                description: "Unit description",
            }),
            props,
        );
        organization.owner ??= new OrgMembership({ organization, account: ACCOUNT_ID });

        return organization;
    }

    public createOrgMembership(props: Unit.Domain.EntityFactory.CreateOrgMembership.Props = {}): Entities.OrgMembership {
        return this.entity(
            new OrgMembership({
                organization: props.organization ?? this.createOrganization(),
                account: ACCOUNT_ID,
            }),
            props,
        );
    }

    public createProject(props: Unit.Domain.EntityFactory.CreateProject.Props = {}): Entities.Project {
        const organization = props.organization ?? this.createOrganization();
        return this.entity(
            new Project({
                organization,
                realm: organization.realm,
                name: "Unit Project",
                description: "Unit description",
            }),
            props,
        );
    }

    public createDepartment(props: Unit.Domain.EntityFactory.CreateDepartment.Props = {}): Entities.Department {
        return this.entity(
            new Department({
                organization: props.organization ?? this.createOrganization(),
                name: "Unit Department",
                description: "Unit description",
            }),
            props,
        );
    }

    public createTeam(props: Unit.Domain.EntityFactory.CreateTeam.Props = {}): Entities.Team {
        const department = props.department ?? this.createDepartment();
        return this.entity(
            new Team({
                organization: props.organization ?? department.organization,
                description: "Unit description",
                name: "Unit Team",
                department,
            }),
            props,
        );
    }

    public createProjectAccountAssignment(
        props: Unit.Domain.EntityFactory.CreateProjectAccountAssignment.Props = {},
    ): Entities.ProjectAccountAssignment {
        const project = props.project ?? this.createProject();
        return this.entity(
            new ProjectAccountAssignment({
                membership:
                    props.membership ??
                    this.createOrgMembership({
                        organization: project.organization,
                    }),
                assignedBy: ACTOR_ID,
                project,
            }),
            props,
        );
    }

    public createDeptAccountAssignment(
        props: Unit.Domain.EntityFactory.CreateDeptAccountAssignment.Props = {},
    ): Entities.DeptAccountAssignment {
        const department = props.department ?? this.createDepartment();
        return this.entity(
            new DeptAccountAssignment({
                membership:
                    props.membership ??
                    this.createOrgMembership({
                        organization: department.organization,
                    }),
                assignedBy: ACTOR_ID,
                department,
            }),
            props,
        );
    }

    public createTeamAccountAssignment(
        props: Unit.Domain.EntityFactory.CreateTeamAccountAssignment.Props = {},
    ): Entities.TeamAccountAssignment {
        const team = props.team ?? this.createTeam();
        return this.entity(
            new TeamAccountAssignment({
                membership:
                    props.membership ??
                    this.createOrgMembership({
                        organization: team.organization,
                    }),
                assignedBy: ACTOR_ID,
                team,
            }),
            props,
        );
    }

    public createInvite(props: Unit.Domain.EntityFactory.CreateInvite.Props = {}): Entities.Invite {
        return this.entity(
            new Invite({
                organization: props.organization ?? this.createOrganization(),
                invitee: ACCOUNT_ID,
                inviter: ACTOR_ID,
                role: ROLE_ID,
            }),
            props,
        );
    }

    public createAuditLog(props: Unit.Domain.EntityFactory.CreateAuditLog.Props = {}): SystemEntities.AuditLog {
        return this.entity(
            new AuditLog({
                context: { userAgent: "unit-agent", ip: "127.0.0.1" },
                entityType: "ORGANIZATION",
                actionType: "CREATE",
            }),
            props,
        );
    }

    public createChangeLog(props: Unit.Domain.EntityFactory.CreateChangeLog.Props = {}): SystemEntities.ChangeLog {
        return this.entity(
            new ChangeLog({
                auditEntry: "00000000-0000-4000-8000-000000000005",
                entity: "00000000-0000-4000-8000-000000000006",
                entityType: "ORGANIZATION",
                changeType: ChangeSetType.CREATE,
                delta: {},
            }),
            props,
        );
    }

    private entity<Entity extends object>(entity: Entity, props: Partial<Entity>): Entity {
        Object.assign(entity, props);
        return entity;
    }
}
