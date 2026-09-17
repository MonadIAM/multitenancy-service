import { Collection } from "@mikro-orm/core";
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

    public description: string;
    public status: TeamStatus;
    public name: string;

    public lead?: Entities.TeamAccountAssignment;
    public organization: Entities.Organization;
    public department: Entities.Department;

    public assignments = new Collection<Entities.TeamAccountAssignment>(this);

    public constructor(props: Entities.Team.ConstructorProps) {
        this.createdAt = new Date();
        this.id = randomUUID();

        this.organization = props.organization;
        this.description = props.description;
        this.department = props.department;
        this.status = TeamStatus.ACTIVE;
        this.name = props.name;
    }

    public assignLead({ assignment }: Entities.Team.AssignLead.Props): void {
        if (this.lead?.id === assignment.id) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            this.lead = assignment;
            this.updatedAt = new Date();
        }
    }

    public unassignLead(): void {
        if (this.lead) {
            this.lead = undefined;
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

    public canPurge(): void {
        if (this.status === TeamStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Team.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }
}
