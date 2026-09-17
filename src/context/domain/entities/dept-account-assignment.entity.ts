import { randomUUID } from "node:crypto";

import { AssignmentStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class DeptAccountAssignment implements Entities.DeptAccountAssignment.Contract {
    private static readonly dictionaryPath = "entities.dept-account-assignment";

    public id: string;
    public assignedAt: Date;
    public updatedAt?: Date;
    public version: number = 1;

    public organization: Entities.Organization;
    public membership: Entities.OrgMembership;
    public department: Entities.Department;
    public assignedBy: string;
    public status: AssignmentStatus;

    public constructor(props: Entities.DeptAccountAssignment.ConstructorProps) {
        this.assignedAt = new Date();
        this.id = randomUUID();

        this.status = AssignmentStatus.ACTIVE;
        this.organization = props.department.organization;
        this.membership = props.membership;
        this.department = props.department;
        this.assignedBy = props.assignedBy;
    }

    public revoke(): void {
        if (this.status === AssignmentStatus.ACTIVE) {
            this.status = AssignmentStatus.REVOKED;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${DeptAccountAssignment.dictionaryPath}.ALREADY_REVOKED`,
            });
        }
    }

    public restore(): void {
        if (this.status === AssignmentStatus.REVOKED) {
            this.status = AssignmentStatus.ACTIVE;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${DeptAccountAssignment.dictionaryPath}.ALREADY_ACTIVE`,
            });
        }
    }

    public canPurge(): void {
        if (this.status === AssignmentStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${DeptAccountAssignment.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
