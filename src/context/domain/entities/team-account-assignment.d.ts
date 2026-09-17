import { AssignmentStatus } from "~context/enums";

declare global {
    namespace Entities {
        type TeamAccountAssignment = TeamAccountAssignment.Contract;

        namespace TeamAccountAssignment {
            interface Contract {
                id: string;
                assignedAt: Date;
                updatedAt?: Date;
                version: number;

                organization: Entities.Organization;
                membership: Entities.OrgMembership;
                team: Entities.Team;
                assignedBy: string;
                status: AssignmentStatus;

                canPurge(): void;
                restore(): void;
                revoke(): void;
            }

            type ConstructorProps = {
                membership: Entities.OrgMembership;
                assignedBy: string;
                team: Entities.Team;
            };
        }
    }
}
