import { randomUUID } from "node:crypto";

import { OrgMembershipStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class OrgMembership implements Entities.OrgMembership.Contract {
    private static readonly dictionaryPath = "entities.org-membership";

    public id: string;
    public createdAt: Date;
    public updatedAt?: Date;
    public suspendedAt?: Date;
    public blockedAt?: Date;
    public joinedAt?: Date;
    public leftAt?: Date;
    public version: number = 1;
    public process?: string;
    public failure?: string;

    public organization: Entities.Organization;
    public status: OrgMembershipStatus;
    public account: string;

    public constructor(props: Entities.OrgMembership.ConstructorProps) {
        const now = new Date();
        this.createdAt = now;
        this.id = randomUUID();

        this.status = OrgMembershipStatus.ACTIVE;
        this.joinedAt = now;
        this.organization = props.organization;
        this.account = props.account;
    }

    public suspend(at: Date = new Date()): void {
        if (this.status === OrgMembershipStatus.ACTIVE) {
            this.status = OrgMembershipStatus.SUSPENDED;
            this.suspendedAt = at;
            this.updatedAt = at;
        } else {
            throw Exception.invariantViolation({
                messageKey: `${OrgMembership.dictionaryPath}.CANNOT_SUSPEND`,
            });
        }
    }

    public activate(at: Date = new Date()): void {
        switch (this.status) {
            case OrgMembershipStatus.SUSPENDED:
                this.status = OrgMembershipStatus.ACTIVE;
                this.suspendedAt = undefined;
                this.updatedAt = at;
                break;
            default:
                throw Exception.invariantViolation({
                    messageKey: `${OrgMembership.dictionaryPath}.CANNOT_ACTIVATE`,
                });
        }
    }

    public leave(at: Date = new Date()): void {
        if ([OrgMembershipStatus.ACTIVE, OrgMembershipStatus.SUSPENDED].includes(this.status)) {
            this.status = OrgMembershipStatus.LEFT;
            this.suspendedAt = undefined;
            this.leftAt = at;
            this.updatedAt = at;
        } else {
            throw Exception.invariantViolation({
                messageKey: `${OrgMembership.dictionaryPath}.CANNOT_LEAVE`,
            });
        }
    }

    public block(at: Date = new Date()): void {
        if ([OrgMembershipStatus.ACTIVE, OrgMembershipStatus.SUSPENDED, OrgMembershipStatus.LEFT].includes(this.status)) {
            this.status = OrgMembershipStatus.BLOCKED;
            this.suspendedAt = undefined;
            this.blockedAt = at;
            this.updatedAt = at;
        } else {
            throw Exception.invariantViolation({
                messageKey: `${OrgMembership.dictionaryPath}.CANNOT_BLOCK`,
            });
        }
    }

    public beginJoin(process: string = randomUUID()): void {
        if (this.process || ![OrgMembershipStatus.ACTIVE, OrgMembershipStatus.LEFT].includes(this.status)) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.status = OrgMembershipStatus.JOINING;
            this.process = process;
            this.failure = undefined;
            this.joinedAt = undefined;
            this.leftAt = undefined;
            this.updatedAt = new Date();
        }
    }

    public confirmJoin(joinedAt: Date): void {
        if (!this.process || this.status !== OrgMembershipStatus.JOINING) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.status = OrgMembershipStatus.ACTIVE;
            this.process = undefined;
            this.joinedAt = joinedAt;
            this.updatedAt = new Date();
        }
    }

    public rejectJoin(reason: string): void {
        if (!this.process || this.status !== OrgMembershipStatus.JOINING) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.status = OrgMembershipStatus.LEFT;
            this.process = undefined;
            this.failure = reason;
            this.leftAt = new Date();
            this.updatedAt = this.leftAt;
        }
    }
}
