import { randomUUID } from "node:crypto";

import { ProjectStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class Project implements Entities.Project.Contract {
    private static readonly dictionaryPath = "entities.project";

    public id: string;
    public createdAt: Date;
    public updatedAt?: Date;
    public archivedAt?: Date;
    public version: number = 1;

    public manager?: Entities.ProjectAccountAssignment;
    public organization: Entities.Organization;
    public status: ProjectStatus;
    public description: string;
    public realm: string;
    public name: string;

    public constructor(props: Entities.Project.ConstructorProps) {
        this.createdAt = new Date();
        this.id = randomUUID();

        this.status = ProjectStatus.ACTIVE;
        this.organization = props.organization;
        this.description = props.description;
        this.realm = props.realm;
        this.name = props.name;
    }

    public assignManager({ assignment }: Entities.Project.AssignManager.Props): void {
        if (this.manager?.id === assignment.id) {
            throw Exception.invariantViolation({
                messageKey: `${Project.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            this.manager = assignment;
            this.updatedAt = new Date();
        }
    }

    public unassignManager(): void {
        if (this.manager) {
            this.manager = undefined;
            this.updatedAt = new Date();
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Project.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        }
    }

    public update({ patch }: Entities.Project.ChangeDataProps): void {
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
                messageKey: `${Project.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Project.dictionaryPath}.EMPTY_UPDATE_PATCH`,
            });
        }
    }

    public archive(): void {
        if (this.status === ProjectStatus.ARCHIVED) {
            throw Exception.invariantViolation({
                messageKey: `${Project.dictionaryPath}.ALREADY_ARCHIVED`,
            });
        } else {
            const now = new Date();
            this.status = ProjectStatus.ARCHIVED;
            this.archivedAt = now;
            this.updatedAt = now;
        }
    }

    public restore(): void {
        if (this.status === ProjectStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Project.dictionaryPath}.ALREADY_ACTIVE`,
            });
        } else {
            this.status = ProjectStatus.ACTIVE;
            this.archivedAt = undefined;
            this.updatedAt = new Date();
        }
    }

    public canPurge(): void {
        if (this.status === ProjectStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Project.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
