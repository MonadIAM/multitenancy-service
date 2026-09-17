import { ChangeSetType } from "@mikro-orm/core";
import { randomUUID } from "node:crypto";

import { AuditLog, ChangeLog } from "~common/transaction-manager/entities";
import { DeltaChanges } from "~common/transaction-manager/value-objects";
import { ActionType, EntityType } from "~context/enums";
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

export class CoreFixture implements Fixtures.Core.Contract {
    public constructor(protected readonly entityManager: ORM.EntityManager) {}

    public async createOrganization(
        props: Fixtures.Core.CreateOrganization.Props = {},
    ): Fixtures.Core.CreateOrganization.Result {
        const organization = new Organization({
            description: props.description ?? "Test organization description",
            realm: props.realm ?? randomUUID(),
            title: props.title ?? "Test Organization",
        });
        const owner = new OrgMembership({
            account: props.ownerAccount ?? randomUUID(),
            organization,
        });

        organization.owner = owner;
        this.entityManager.persist([organization, owner]);
        await this.entityManager.flush();

        return organization;
    }

    public async createOrgMembership(
        props: Fixtures.Core.CreateOrgMembership.Props,
    ): Fixtures.Core.CreateOrgMembership.Result {
        return await this.persist(
            new OrgMembership({
                account: props.account ?? randomUUID(),
                organization: props.organization,
            }),
        );
    }

    public async createInvite(props: Fixtures.Core.CreateInvite.Props): Fixtures.Core.CreateInvite.Result {
        return await this.persist(
            new Invite({
                expiresAt: props.expiresAt,
                organization: props.organization,
                invitee: props.invitee ?? randomUUID(),
                inviter: props.inviter ?? randomUUID(),
                role: props.role ?? randomUUID(),
            }),
        );
    }

    public async createProject(props: Fixtures.Core.CreateProject.Props): Fixtures.Core.CreateProject.Result {
        return await this.persist(
            new Project({
                description: props.description ?? "Test project description",
                organization: props.organization,
                realm: props.realm ?? randomUUID(),
                name: props.name ?? "Test Project",
            }),
        );
    }

    public async createProjectAccountAssignment(
        props: Fixtures.Core.CreateProjectAccountAssignment.Props,
    ): Fixtures.Core.CreateProjectAccountAssignment.Result {
        return await this.persist(
            new ProjectAccountAssignment({
                membership: props.membership,
                project: props.project,
                assignedBy: props.assignedBy ?? randomUUID(),
            }),
        );
    }

    public async createDepartment(props: Fixtures.Core.CreateDepartment.Props): Fixtures.Core.CreateDepartment.Result {
        return await this.persist(
            new Department({
                description: props.description ?? "Test department description",
                organization: props.organization,
                name: props.name ?? "Test Department",
            }),
        );
    }

    public async createDeptAccountAssignment(
        props: Fixtures.Core.CreateDeptAccountAssignment.Props,
    ): Fixtures.Core.CreateDeptAccountAssignment.Result {
        return await this.persist(
            new DeptAccountAssignment({
                membership: props.membership,
                department: props.department,
                assignedBy: props.assignedBy ?? randomUUID(),
            }),
        );
    }

    public async createTeam(props: Fixtures.Core.CreateTeam.Props): Fixtures.Core.CreateTeam.Result {
        return await this.persist(
            new Team({
                organization: props.organization ?? props.department.organization,
                description: props.description ?? "Test team description",
                department: props.department,
                name: props.name ?? "Test Team",
            }),
        );
    }

    public async createTeamAccountAssignment(
        props: Fixtures.Core.CreateTeamAccountAssignment.Props,
    ): Fixtures.Core.CreateTeamAccountAssignment.Result {
        return await this.persist(
            new TeamAccountAssignment({
                membership: props.membership,
                assignedBy: props.assignedBy ?? randomUUID(),
                team: props.team,
            }),
        );
    }

    public async createAuditLog(props: Fixtures.Core.CreateAuditLog.Props = {}): Fixtures.Core.CreateAuditLog.Result {
        const auditLog = new AuditLog({
            entityType: props.entityType ?? EntityType.EXAMPLE,
            actionType: props.actionType ?? ActionType.CREATE,
            actor: props.actor ?? randomUUID(),
            realm: props.realm ?? randomUUID(),
            input: props.input,
            context: {
                ip: props.context?.ip ?? "127.0.0.1",
                userAgent: props.context?.userAgent ?? "multitenancy-test",
            },
        });

        auditLog.sign({ keyVersion: 1, signature: "test-signature" });
        auditLog.createdAt = props.createdAt ?? auditLog.createdAt;

        return await this.persist(auditLog);
    }

    public async createChangeLog(props: Fixtures.Core.CreateChangeLog.Props = {}): Fixtures.Core.CreateChangeLog.Result {
        const auditEntry = props.auditEntry ?? (await this.createAuditLog());
        const changeLog = new ChangeLog({
            delta: props.delta ?? new DeltaChanges({ name: { old: null, new: "Updated Name" } }),
            changeType: props.changeType ?? ChangeSetType.CREATE,
            entityType: props.entityType ?? EntityType.EXAMPLE,
            entity: props.entity ?? randomUUID(),
            auditEntry: auditEntry.id,
        });

        changeLog.sign({ keyVersion: 1, signature: "test-signature" });

        return await this.persist(changeLog);
    }

    protected async persist<Entity extends ORM.AnyEntity>(entity: Entity): Promise<Entity> {
        this.entityManager.persist(entity);
        await this.entityManager.flush();
        return entity;
    }
}
