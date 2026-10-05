import { ChangeSetType } from "@mikro-orm/core";
import { randomUUID } from "node:crypto";

import { EntityFactoryRegistry } from "~testing/entity-factory.registry";
import { DeltaChanges } from "~common/transaction-manager/value-objects";
import { ActionType, EntityType } from "~context/enums";

export class CoreFixture implements Fixtures.Core.Contract {
    private readonly entities = new EntityFactoryRegistry();

    public constructor(protected readonly entityManager: ORM.EntityManager) {}

    public async createOrganization(
        props: Fixtures.Core.CreateOrganization.Props = {},
    ): Fixtures.Core.CreateOrganization.Result {
        const organization = this.entities.createOrganization({
            ...props,
            description: props.description ?? "Test organization description",
            ownerAccount: props.ownerAccount ?? randomUUID(),
            realm: props.realm ?? randomUUID(),
            title: props.title ?? "Test Organization",
        });

        this.entityManager.persist([organization, organization.owner]);
        await this.entityManager.flush();

        return organization;
    }

    public async createOrgMembership(
        props: Fixtures.Core.CreateOrgMembership.Props,
    ): Fixtures.Core.CreateOrgMembership.Result {
        return await this.persist(
            this.entities.createOrgMembership({
                ...props,
                account: props.account ?? randomUUID(),
            }),
        );
    }

    public async createInvite(props: Fixtures.Core.CreateInvite.Props): Fixtures.Core.CreateInvite.Result {
        return await this.persist(
            this.entities.createInvite({
                ...props,
                invitee: props.invitee ?? randomUUID(),
                inviter: props.inviter ?? randomUUID(),
                role: props.role ?? randomUUID(),
            }),
        );
    }

    public async createProject(props: Fixtures.Core.CreateProject.Props): Fixtures.Core.CreateProject.Result {
        return await this.persist(
            this.entities.createProject({
                ...props,
                description: props.description ?? "Test project description",
                realm: props.realm ?? randomUUID(),
                name: props.name ?? "Test Project",
            }),
        );
    }

    public async createProjectAccountAssignment(
        props: Fixtures.Core.CreateProjectAccountAssignment.Props,
    ): Fixtures.Core.CreateProjectAccountAssignment.Result {
        return await this.persist(
            this.entities.createProjectAccountAssignment({
                ...props,
                assignedBy: props.assignedBy ?? randomUUID(),
            }),
        );
    }

    public async createDepartment(props: Fixtures.Core.CreateDepartment.Props): Fixtures.Core.CreateDepartment.Result {
        return await this.persist(
            this.entities.createDepartment({
                ...props,
                description: props.description ?? "Test department description",
                name: props.name ?? "Test Department",
            }),
        );
    }

    public async createTeam(props: Fixtures.Core.CreateTeam.Props): Fixtures.Core.CreateTeam.Result {
        return await this.persist(
            this.entities.createTeam({
                ...props,
                organization: props.organization ?? props.department.organization,
                description: props.description ?? "Test team description",
                name: props.name ?? "Test Team",
            }),
        );
    }

    public async createAuditLog(props: Fixtures.Core.CreateAuditLog.Props = {}): Fixtures.Core.CreateAuditLog.Result {
        const auditLog = this.entities.createAuditLog({
            entityType: props.entityType ?? EntityType.ORGANIZATION,
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
        const changeLog = this.entities.createChangeLog({
            delta: props.delta ?? new DeltaChanges({ name: { old: null, new: "Updated Name" } }),
            changeType: props.changeType ?? ChangeSetType.CREATE,
            entityType: props.entityType ?? EntityType.ORGANIZATION,
            entity: props.entity ?? randomUUID(),
            auditEntry: auditEntry.id,
        });

        changeLog.sign({ keyVersion: 1, signature: "test-signature" });
        changeLog.createdAt = props.createdAt ?? changeLog.createdAt;

        return await this.persist(changeLog);
    }

    protected async persist<Entity extends ORM.AnyEntity>(entity: Entity): Promise<Entity> {
        this.entityManager.persist(entity);
        await this.entityManager.flush();
        return entity;
    }
}
