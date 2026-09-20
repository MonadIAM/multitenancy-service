import { OrganizationStatus } from "~context/enums";

declare global {
    namespace Entities {
        type Organization = Organization.Contract;

        namespace Organization {
            interface Contract {
                id: string;
                createdAt: Date;
                updatedAt?: Date;
                revokedAt?: Date;
                version: number;
                process?: string;
                failure?: string;

                status: OrganizationStatus;
                description: string;
                realm: string;
                title: string;

                owner: Entities.OrgMembership;
                pendingOwner?: string;

                memberships: ORM.Collection<Entities.OrgMembership>;

                beginTransfer(membership: Entities.OrgMembership): void;
                transferOwnership(props: TransferOwnership.Props): void;
                rejectBootstrap(reason: string): void;
                update(props: ChangeDataProps): void;
                confirmBootstrap(): void;
                finishTransfer(): void;
                beginBootstrap(): void;
                assertReady(): void;
                canPurge(): void;
                restore(): void;
                revoke(): void;
            }

            type ConstructorProps = {
                realm: string;
                title: string;
                description: string;
                owner?: Entities.OrgMembership;
            };

            type MutableFields = Pick<Contract, "title" | "description">;

            type ChangeDataProps = {
                patch: Partial<MutableFields>;
            };

            namespace TransferOwnership {
                type Props = { membership: Entities.OrgMembership };
            }
        }
    }
}
