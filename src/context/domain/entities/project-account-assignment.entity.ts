import { randomUUID } from "node:crypto";

import { AssignmentStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class ProjectAccountAssignment implements Entities.ProjectAccountAssignment.Contract {
    private static readonly dictionaryPath = "entities.project-account-assignment";

    public id: string;
    public assignedAt: Date;
    public updatedAt?: Date;
    public version: number = 1;

    public organization: Entities.Organization;
    public membership: Entities.Membership;
    public project: Entities.Project;
    public assignedBy: string;
    public status: AssignmentStatus;

    public constructor(props: Entities.ProjectAccountAssignment.ConstructorProps) {
        this.assignedAt = new Date();
        this.id = randomUUID();

        this.status = AssignmentStatus.ACTIVE;
        this.organization = props.project.organization;
        this.membership = props.membership;
        this.project = props.project;
        this.assignedBy = props.assignedBy;
    }

    public revoke(): void {
        if (this.status === AssignmentStatus.ACTIVE) {
            this.status = AssignmentStatus.REVOKED;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${ProjectAccountAssignment.dictionaryPath}.ALREADY_REVOKED`,
            });
        }
    }

    public restore(): void {
        if (this.status === AssignmentStatus.REVOKED) {
            this.status = AssignmentStatus.ACTIVE;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${ProjectAccountAssignment.dictionaryPath}.ALREADY_ACTIVE`,
            });
        }
    }

    public canPurge(): void {
        if (this.status === AssignmentStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${ProjectAccountAssignment.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
