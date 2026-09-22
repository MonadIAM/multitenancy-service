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

export class EntityFactoryRegistry implements Testing.EntityFactory.Contract {
    public createOrganization(props: Testing.EntityFactory.CreateOrganization.Props = {}): Entities.Organization {
        const { ownerAccount, ...state } = props;
        const organization = this.entity(
            new Organization({
                ...state,
                realm: props.realm ?? REALM_ID,
                title: props.title ?? "Unit Organization",
                description: props.description ?? "Unit description",
            }),
            state,
        );
        organization.owner ??= this.createOrgMembership({ organization, account: ownerAccount ?? ACCOUNT_ID });

        return organization;
    }

    public createOrgMembership(props: Testing.EntityFactory.CreateOrgMembership.Props = {}): Entities.OrgMembership {
        return this.entity(
            new OrgMembership({
                ...props,
                organization: props.organization ?? this.createOrganization(),
                account: props.account ?? ACCOUNT_ID,
            }),
            props,
        );
    }

    public createProject(props: Testing.EntityFactory.CreateProject.Props = {}): Entities.Project {
        const organization = props.organization ?? this.createOrganization();
        return this.entity(
            new Project({
                ...props,
                organization,
                realm: props.realm ?? organization.realm,
                name: props.name ?? "Unit Project",
                description: props.description ?? "Unit description",
            }),
            props,
        );
    }

    public createDepartment(props: Testing.EntityFactory.CreateDepartment.Props = {}): Entities.Department {
        return this.entity(
            new Department({
                ...props,
                organization: props.organization ?? this.createOrganization(),
                name: props.name ?? "Unit Department",
                description: props.description ?? "Unit description",
            }),
            props,
        );
    }

    public createTeam(props: Testing.EntityFactory.CreateTeam.Props = {}): Entities.Team {
        const department =
            props.department ?? this.createDepartment({ organization: props.organization ?? this.createOrganization() });
        return this.entity(
            new Team({
                ...props,
                organization: props.organization ?? department.organization,
                description: props.description ?? "Unit description",
                name: props.name ?? "Unit Team",
                department,
            }),
            props,
        );
    }

    public createProjectAccountAssignment(
        props: Testing.EntityFactory.CreateProjectAccountAssignment.Props = {},
    ): Entities.ProjectAccountAssignment {
        const project =
            props.project ??
            this.createProject({ organization: props.membership?.organization ?? this.createOrganization() });
        return this.entity(
            new ProjectAccountAssignment({
                ...props,
                membership:
                    props.membership ??
                    this.createOrgMembership({
                        organization: project.organization,
                    }),
                assignedBy: props.assignedBy ?? ACTOR_ID,
                project,
            }),
            props,
        );
    }

    public createDeptAccountAssignment(
        props: Testing.EntityFactory.CreateDeptAccountAssignment.Props = {},
    ): Entities.DeptAccountAssignment {
        const department =
            props.department ??
            this.createDepartment({ organization: props.membership?.organization ?? this.createOrganization() });
        return this.entity(
            new DeptAccountAssignment({
                ...props,
                membership:
                    props.membership ??
                    this.createOrgMembership({
                        organization: department.organization,
                    }),
                assignedBy: props.assignedBy ?? ACTOR_ID,
                department,
            }),
            props,
        );
    }

    public createTeamAccountAssignment(
        props: Testing.EntityFactory.CreateTeamAccountAssignment.Props = {},
    ): Entities.TeamAccountAssignment {
        const team =
            props.team ?? this.createTeam({ organization: props.membership?.organization ?? this.createOrganization() });
        return this.entity(
            new TeamAccountAssignment({
                ...props,
                membership:
                    props.membership ??
                    this.createOrgMembership({
                        organization: team.organization,
                    }),
                assignedBy: props.assignedBy ?? ACTOR_ID,
                team,
            }),
            props,
        );
    }

    public createInvite(props: Testing.EntityFactory.CreateInvite.Props = {}): Entities.Invite {
        return this.entity(
            new Invite({
                ...props,
                organization: props.organization ?? this.createOrganization(),
                invitee: props.invitee ?? ACCOUNT_ID,
                inviter: props.inviter ?? ACTOR_ID,
                role: props.role ?? ROLE_ID,
            }),
            props,
        );
    }

    public createAuditLog(props: Testing.EntityFactory.CreateAuditLog.Props = {}): SystemEntities.AuditLog {
        const { context, ...state } = props;

        return this.entity(
            new AuditLog({
                ...state,
                context: { userAgent: context?.userAgent ?? "unit-agent", ip: context?.ip ?? "127.0.0.1" },
                entityType: props.entityType ?? "ORGANIZATION",
                actionType: props.actionType ?? "CREATE",
            }),
            state,
        );
    }

    public createChangeLog(props: Testing.EntityFactory.CreateChangeLog.Props = {}): SystemEntities.ChangeLog {
        return this.entity(
            new ChangeLog({
                ...props,
                auditEntry: props.auditEntry ?? "00000000-0000-4000-8000-000000000005",
                entity: props.entity ?? "00000000-0000-4000-8000-000000000006",
                entityType: props.entityType ?? "ORGANIZATION",
                changeType: props.changeType ?? ChangeSetType.CREATE,
                delta: props.delta ?? {},
            }),
            props,
        );
    }

    private entity<Entity extends object>(entity: Entity, props: Partial<Entity>): Entity {
        Object.assign(entity, props);
        return entity;
    }
}
