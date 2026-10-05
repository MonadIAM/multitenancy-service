import { randomUUID } from "node:crypto";

import { Exception } from "~common/exceptions";
import { TeamStatus } from "~context/enums";

export class Team implements Entities.Team.Contract {
    private static readonly dictionaryPath = "entities.team";

    public id: string;
    public createdAt: Date;
    public updatedAt?: Date;
    public archivedAt?: Date;
    public version: number = 1;

    public previousPosition?: string;
    public leadPosition?: string;
    public description: string;
    public status: TeamStatus;
    public process?: string;
    public name: string;

    public organization: Entities.Organization;
    public department: Entities.Department;

    public constructor(props: Entities.Team.ConstructorProps) {
        this.createdAt = new Date();
        this.id = randomUUID();

        this.organization = props.organization;
        this.description = props.description;
        this.department = props.department;
        this.status = TeamStatus.ACTIVE;
        this.name = props.name;
    }

    public assignLead({ position }: Entities.Team.AssignLead.Props): void {
        this.assertReady();

        if (this.leadPosition === position) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            this.previousPosition = this.leadPosition;
            this.leadPosition = position;
            this.process = randomUUID();
            this.updatedAt = new Date();
        }
    }

    public unassignLead(): void {
        if (this.leadPosition) {
            this.leadPosition = undefined;
            this.previousPosition = undefined;
            this.process = undefined;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        }
    }

    public update({ patch }: Entities.Team.ChangeDataProps): void {
        const now = new Date();
        let affected = 0;
        for (const [key, value] of Object.typedEntries(patch)) {
            if (typeof value !== "undefined" && value !== this[key]) {
                (this[key] as unknown) = value;
                ++affected;
            }
        }

        if (affected) {
            this.updatedAt = now;
        } else if (Object.keys(patch).length) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.EMPTY_UPDATE_PATCH`,
            });
        }
    }

    public archive(): void {
        if (this.status === TeamStatus.ARCHIVED) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.ALREADY_ARCHIVED`,
            });
        } else {
            const now = new Date();
            this.status = TeamStatus.ARCHIVED;
            this.archivedAt = now;
            this.updatedAt = now;
        }
    }

    public restore(): void {
        if (this.status === TeamStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.ALREADY_ACTIVE`,
            });
        } else {
            this.status = TeamStatus.ACTIVE;
            this.archivedAt = undefined;
            this.updatedAt = new Date();
        }
    }

    public assertReady(): void {
        if (this.process) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        }
    }

    public completePosition(rejected: boolean): void {
        if (rejected) {
            this.leadPosition = this.previousPosition;
            this.updatedAt = new Date();
        }

        this.previousPosition = undefined;
        this.process = undefined;
    }

    public releasePosition(positions: string[]): void {
        if (this.previousPosition && positions.includes(this.previousPosition)) {
            this.previousPosition = undefined;
        }

        if (!this.process && this.leadPosition && positions.includes(this.leadPosition)) {
            this.leadPosition = undefined;
            this.updatedAt = new Date();
        }
    }

    public canPurge(): void {
        if (this.status === TeamStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
