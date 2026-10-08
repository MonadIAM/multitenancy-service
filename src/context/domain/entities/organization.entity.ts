import { Collection } from "@mikro-orm/core";
import { randomUUID } from "node:crypto";

import { OrganizationStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

export class Organization implements Entities.Organization.Contract {
    private static readonly dictionaryPath = "entities.organization";

    public id: string;
    public createdAt: Date;
    public updatedAt?: Date;
    public revokedAt?: Date;
    public version: number = 1;
    public process?: string;
    public failure?: string;

    public status: OrganizationStatus;
    public description: string;
    public realm: string;
    public title: string;

    public owner!: Entities.Membership;
    public pendingOwner?: string;

    public memberships = new Collection<Entities.Membership>(this);

    public constructor(props: Entities.Organization.ConstructorProps) {
        this.createdAt = new Date();
        this.id = randomUUID();

        this.status = OrganizationStatus.ACTIVE;
        this.description = props.description;
        this.realm = props.realm;
        this.title = props.title;

        if (props.owner) {
            this.owner = props.owner;
        }
    }

    public update({ patch }: Entities.Organization.ChangeDataProps): void {
        this.assertReady();
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
                messageKey: `${Organization.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            throw Exception.invariantViolation({
                messageKey: `${Organization.dictionaryPath}.EMPTY_UPDATE_PATCH`,
            });
        }
    }

    public transferOwnership({ membership }: Entities.Organization.TransferOwnership.Props): void {
        if (this.owner?.id === membership.id) {
            throw Exception.invariantViolation({
                messageKey: `${Organization.dictionaryPath}.NO_CHANGES_DETECTED`,
            });
        } else {
            this.owner = membership;
            this.updatedAt = new Date();
        }
    }

    public revoke(): void {
        this.assertReady();
        if (this.status === OrganizationStatus.REVOKED) {
            throw Exception.invariantViolation({
                messageKey: `${Organization.dictionaryPath}.ALREADY_REVOKED`,
            });
        } else {
            const now = new Date();
            this.status = OrganizationStatus.REVOKED;
            this.revokedAt = now;
            this.updatedAt = now;
        }
    }

    public restore(): void {
        this.assertReady();
        if (this.status === OrganizationStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Organization.dictionaryPath}.ALREADY_ACTIVE`,
            });
        } else {
            this.status = OrganizationStatus.ACTIVE;
            this.revokedAt = undefined;
            this.updatedAt = new Date();
        }
    }

    public canPurge(): void {
        if (this.process) {
            throw Exception.invariantViolation({ messageKey: "services.workflow.OPERATION_PENDING" });
        } else if (this.status === OrganizationStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Organization.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }

    public beginBootstrap(): void {
        if (this.process || this.status !== OrganizationStatus.ACTIVE) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.process = randomUUID();
            this.status = OrganizationStatus.PROVISIONING;
            this.failure = undefined;
        }
    }

    public confirmBootstrap(): void {
        if (!this.process || this.status !== OrganizationStatus.PROVISIONING) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.status = OrganizationStatus.ACTIVE;
            this.process = undefined;
            this.failure = undefined;
            this.updatedAt = new Date();
        }
    }

    public rejectBootstrap(reason: string): void {
        if (!this.process || this.status !== OrganizationStatus.PROVISIONING) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.status = OrganizationStatus.FAILED;
            this.process = undefined;
            this.failure = reason;
            this.updatedAt = new Date();
        }
    }

    public assertReady(): void {
        if (this.process || this.status === OrganizationStatus.FAILED) {
            throw Exception.invariantViolation({ messageKey: "services.workflow.OPERATION_PENDING" });
        }
    }

    public beginTransfer(membership: Entities.Membership): void {
        this.assertReady();

        if (this.status !== OrganizationStatus.ACTIVE || membership.id === this.owner.id) {
            throw Exception.invariantViolation({ messageKey: "services.workflow.TRANSFER_NOT_ALLOWED" });
        } else {
            this.process = randomUUID();
            this.pendingOwner = membership.id;
            this.failure = undefined;
            this.updatedAt = new Date();
        }
    }

    public finishTransfer(): void {
        if (!this.process || !this.pendingOwner || this.status !== OrganizationStatus.ACTIVE) {
            throw Exception.conflict({ messageKey: "services.workflow.OPERATION_CONFLICT" });
        } else {
            this.pendingOwner = undefined;
            this.process = undefined;
            this.updatedAt = new Date();
        }
    }
}
