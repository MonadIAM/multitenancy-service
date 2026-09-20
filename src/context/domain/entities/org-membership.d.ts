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
                process?: string;
                failure?: string;

                organization: Entities.Organization;
                status: OrgMembershipStatus;
                account: string;

                beginJoin(process?: string): void;
                confirmJoin(joinedAt: Date): void;
                rejectJoin(reason: string): void;
                activate(at?: Date): void;
                suspend(at?: Date): void;
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
