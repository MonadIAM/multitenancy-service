import { Collection } from "@mikro-orm/core";
import { randomUUID } from "node:crypto";

import { OrganizationStatus, PlatformService } from "~context/enums";
import { Exception } from "~common/exceptions";

export class Organization implements Entities.Organization.Contract {
    private static readonly dictionaryPath = "entities.organization";

    public id: string;
    public createdAt: Date;
    public updatedAt?: Date;
    public revokedAt?: Date;
    public version: number = 1;
    public process?: string;
    public bootstrapPending: PlatformService[] = [];

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
            throw Exception.invariantViolation({ messageKey: `${Organization.dictionaryPath}.OPERATION_PENDING` });
        } else if (this.status === OrganizationStatus.ACTIVE) {
            throw Exception.invariantViolation({
                messageKey: `${Organization.dictionaryPath}.CANNOT_PURGE_ACTIVE`,
            });
        }
    }

    public beginBootstrap(): void {
        if (this.process || this.status !== OrganizationStatus.ACTIVE) {
            throw Exception.conflict({ messageKey: `${Organization.dictionaryPath}.OPERATION_CONFLICT` });
        } else {
            this.process = randomUUID();
            this.status = OrganizationStatus.PROVISIONING;
            this.bootstrapPending = [PlatformService.ACCESS_CONTROL_SERVICE, PlatformService.HR_SERVICE];
        }
    }

    public confirmBootstrap(service: PlatformService): boolean {
        if (!this.process || this.status !== OrganizationStatus.PROVISIONING) {
            throw Exception.conflict({ messageKey: `${Organization.dictionaryPath}.OPERATION_CONFLICT` });
        } else if (this.bootstrapPending.includes(service)) {
            this.bootstrapPending = this.bootstrapPending.filter((pending) => pending !== service);

            if (this.bootstrapPending.length) {
                return false;
            }

            this.status = OrganizationStatus.ACTIVE;
            this.updatedAt = new Date();
            this.process = undefined;

            return true;
        } else {
            return false;
        }
    }

    public assertReady(): void {
        if (this.process || this.status === OrganizationStatus.PROVISIONING) {
            throw Exception.invariantViolation({ messageKey: `${Organization.dictionaryPath}.OPERATION_PENDING` });
        }
    }

    public beginTransfer(membership: Entities.Membership): void {
        this.assertReady();

        if (this.status !== OrganizationStatus.ACTIVE || membership.id === this.owner.id) {
            throw Exception.invariantViolation({ messageKey: `${Organization.dictionaryPath}.TRANSFER_NOT_ALLOWED` });
        } else {
            this.process = randomUUID();
            this.pendingOwner = membership.id;
            this.updatedAt = new Date();
        }
    }

    public finishTransfer(): void {
        if (!this.process || !this.pendingOwner || this.status !== OrganizationStatus.ACTIVE) {
            throw Exception.conflict({ messageKey: `${Organization.dictionaryPath}.OPERATION_CONFLICT` });
        } else {
            this.pendingOwner = undefined;
            this.process = undefined;
            this.updatedAt = new Date();
        }
    }
}
