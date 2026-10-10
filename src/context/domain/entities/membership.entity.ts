import { randomUUID } from "node:crypto";

import { MembershipStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class Membership implements Entities.Membership.Contract {
    private static readonly dictionaryPath = "entities.membership";

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
    public status: MembershipStatus;
    public account: string;

    public constructor(props: Entities.Membership.ConstructorProps) {
        const now = new Date();
        this.createdAt = now;
        this.id = randomUUID();

        this.status = MembershipStatus.ACTIVE;
        this.joinedAt = now;
        this.organization = props.organization;
        this.account = props.account;
    }

    public suspend(at: Date = new Date()): void {
        if (this.status === MembershipStatus.ACTIVE) {
            this.status = MembershipStatus.SUSPENDED;
            this.suspendedAt = at;
            this.updatedAt = at;
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Membership.dictionaryPath}.CANNOT_SUSPEND`,
            });
        }
    }

    public activate(at: Date = new Date()): void {
        switch (this.status) {
            case MembershipStatus.SUSPENDED:
                this.status = MembershipStatus.ACTIVE;
                this.suspendedAt = undefined;
                this.updatedAt = at;
                break;
            default:
                throw Exception.invariantViolation({
                    messageKey: `${Membership.dictionaryPath}.CANNOT_ACTIVATE`,
                });
        }
    }

    public leave(at: Date = new Date()): void {
        if ([MembershipStatus.ACTIVE, MembershipStatus.SUSPENDED].includes(this.status)) {
            this.status = MembershipStatus.LEFT;
            this.suspendedAt = undefined;
            this.leftAt = at;
            this.updatedAt = at;
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Membership.dictionaryPath}.CANNOT_LEAVE`,
            });
        }
    }

    public block(at: Date = new Date()): void {
        if ([MembershipStatus.ACTIVE, MembershipStatus.SUSPENDED, MembershipStatus.LEFT].includes(this.status)) {
            this.status = MembershipStatus.BLOCKED;
            this.suspendedAt = undefined;
            this.blockedAt = at;
            this.updatedAt = at;
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Membership.dictionaryPath}.CANNOT_BLOCK`,
            });
        }
    }

    public beginJoin(process: string = randomUUID()): void {
        if (this.process || ![MembershipStatus.ACTIVE, MembershipStatus.LEFT].includes(this.status)) {
            throw Exception.conflict({ messageKey: `${Membership.dictionaryPath}.OPERATION_CONFLICT` });
        } else {
            this.status = MembershipStatus.JOINING;
            this.process = process;
            this.failure = undefined;
            this.joinedAt = undefined;
            this.leftAt = undefined;
            this.updatedAt = new Date();
        }
    }

    public confirmJoin(joinedAt: Date): void {
        if (!this.process || this.status !== MembershipStatus.JOINING) {
            throw Exception.conflict({ messageKey: `${Membership.dictionaryPath}.OPERATION_CONFLICT` });
        } else {
            this.status = MembershipStatus.ACTIVE;
            this.process = undefined;
            this.joinedAt = joinedAt;
            this.updatedAt = new Date();
        }
    }

    public rejectJoin(reason: string): void {
        if (!this.process || this.status !== MembershipStatus.JOINING) {
            throw Exception.conflict({ messageKey: `${Membership.dictionaryPath}.OPERATION_CONFLICT` });
        } else {
            this.status = MembershipStatus.LEFT;
            this.process = undefined;
            this.failure = reason;
            this.leftAt = new Date();
            this.updatedAt = this.leftAt;
        }
    }
}
