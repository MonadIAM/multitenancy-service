import { OrgMembershipStatus } from "~context/enums";

declare global {
    namespace Entities {
        type OrgMembership = OrgMembership.Contract;

        namespace OrgMembership {
            interface Contract {
                id: string;
                createdAt: Date;
                updatedAt?: Date;
                suspendedAt?: Date;
                blockedAt?: Date;
                joinedAt?: Date;
                leftAt?: Date;
                version: number;

                organization: Entities.Organization;
                status: OrgMembershipStatus;
                account: string;

                suspend(at?: Date): void;
                activate(at?: Date): void;
                leave(at?: Date): void;
                block(at?: Date): void;
            }

            type ConstructorProps = {
                organization: Entities.Organization;
                account: string;
            };
        }
    }
}
