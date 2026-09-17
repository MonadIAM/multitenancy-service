import { randomUUID } from "node:crypto";

import { AssignmentStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class TeamAccountAssignment implements Entities.TeamAccountAssignment.Contract {
    private static readonly dictionaryPath = "entities.team-account-assignment";

    public id: string;
    public assignedAt: Date;
    public updatedAt?: Date;
    public version: number = 1;

    public organization: Entities.Organization;
    public membership: Entities.OrgMembership;
    public status: AssignmentStatus;
    public team: Entities.Team;
    public assignedBy: string;

    public constructor(props: Entities.TeamAccountAssignment.ConstructorProps) {
        this.assignedAt = new Date();
        this.id = randomUUID();

        this.organization = props.team.organization;
        this.status = AssignmentStatus.ACTIVE;
        this.membership = props.membership;
        this.assignedBy = props.assignedBy;
        this.team = props.team;
    }

    public revoke(): void {
        if (this.status === AssignmentStatus.ACTIVE) {
            this.status = AssignmentStatus.REVOKED;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${TeamAccountAssignment.dictionaryPath}.ALREADY_REVOKED`,
            });
        }
    }

    public restore(): void {
        if (this.status === AssignmentStatus.REVOKED) {
            this.status = AssignmentStatus.ACTIVE;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${TeamAccountAssignment.dictionaryPath}.ALREADY_ACTIVE`,
            });
        }
    }

    public canPurge(): void {
        if (this.status === AssignmentStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${TeamAccountAssignment.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
