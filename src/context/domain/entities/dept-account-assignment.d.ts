import { AssignmentStatus } from "~context/enums";

declare global {
    namespace Entities {
        type DeptAccountAssignment = DeptAccountAssignment.Contract;

        namespace DeptAccountAssignment {
            interface Contract {
                id: string;
                assignedAt: Date;
                updatedAt?: Date;
                version: number;

                organization: Entities.Organization;
                membership: Entities.OrgMembership;
                department: Entities.Department;
                status: AssignmentStatus;
                assignedBy: string;

                canPurge(): void;
                restore(): void;
                revoke(): void;
            }

            type ConstructorProps = {
                membership: Entities.OrgMembership;
                department: Entities.Department;
                assignedBy: string;
            };
        }
    }
}
