import { randomUUID } from "node:crypto";

import { DepartmentStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class Department implements Entities.Department.Contract {
    private static readonly dictionaryPath = "entities.department";

    public id: string;
    public createdAt: Date;
    public updatedAt?: Date;
    public archivedAt?: Date;
    public version: number = 1;

    public previousPosition?: string;
    public status: DepartmentStatus;
    public managerPosition?: string;
    public description: string;
    public process?: string;
    public name: string;

    public organization: Entities.Organization;

    public constructor(props: Entities.Department.ConstructorProps) {
        this.createdAt = new Date();
        this.id = randomUUID();

        this.status = DepartmentStatus.ACTIVE;
        this.organization = props.organization;
        this.description = props.description;
        this.name = props.name;
    }

    public assignManager({ position }: Entities.Department.AssignManager.Props): void {
        this.assertReady();

        if (this.managerPosition === position) {
            throw Exception.invariantViolation({
                messageKey: `${Department.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            this.previousPosition = this.managerPosition;
            this.managerPosition = position;
            this.process = randomUUID();
            this.updatedAt = new Date();
        }
    }

    public unassignManager(): void {
        if (this.managerPosition) {
            this.managerPosition = undefined;
            this.previousPosition = undefined;
            this.process = undefined;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Department.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        }
    }

    public update({ patch }: Entities.Department.ChangeDataProps): void {
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
                messageKey: `${Department.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Department.dictionaryPath}.EMPTY_UPDATE_PATCH`,
            });
        }
    }

    public archive(): void {
        if (this.status === DepartmentStatus.ARCHIVED) {
            throw Exception.invariantViolation({
                messageKey: `${Department.dictionaryPath}.ALREADY_ARCHIVED`,
            });
        } else {
            const now = new Date();
            this.status = DepartmentStatus.ARCHIVED;
            this.archivedAt = now;
            this.updatedAt = now;
        }
    }

    public restore(): void {
        if (this.status === DepartmentStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Department.dictionaryPath}.ALREADY_ACTIVE`,
            });
        } else {
            this.status = DepartmentStatus.ACTIVE;
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
            this.managerPosition = this.previousPosition;
            this.updatedAt = new Date();
        }

        this.previousPosition = undefined;
        this.process = undefined;
    }

    public releasePosition(positions: string[]): void {
        if (this.previousPosition && positions.includes(this.previousPosition)) {
            this.previousPosition = undefined;
        }

        if (!this.process && this.managerPosition && positions.includes(this.managerPosition)) {
            this.managerPosition = undefined;
            this.updatedAt = new Date();
        }
    }

    public canPurge(): void {
        if (this.status === DepartmentStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Department.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
