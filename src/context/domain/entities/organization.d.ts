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

                status: OrganizationStatus;
                description: string;
                realm: string;
                title: string;

                owner: Entities.OrgMembership;

                memberships: ORM.Collection<Entities.OrgMembership>;

                transferOwnership(props: TransferOwnership.Props): void;
                update(props: ChangeDataProps): void;
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
