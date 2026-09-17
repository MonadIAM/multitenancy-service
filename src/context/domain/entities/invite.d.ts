import { InviteStatus } from "~context/enums";

declare global {
    namespace Entities {
        type Invite = Invite.Contract;

        namespace Invite {
            interface Contract {
                id: string;
                createdAt: Date;
                updatedAt?: Date;
                expiresAt?: Date;
                version: number;

                organization: Entities.Organization;
                invitee: string;
                inviter: string;
                role: string;
                status: InviteStatus;

                invalidate(at?: Date): void;
                decline(at?: Date): void;
                cancel(at?: Date): void;
                accept(at?: Date): void;
                expire(at?: Date): void;
            }

            type ConstructorProps = {
                organization: Entities.Organization;
                expiresAt?: Date;
                invitee: string;
                inviter: string;
                role: string;
            };
        }
    }
}
