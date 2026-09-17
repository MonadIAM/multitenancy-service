import { TeamStatus } from "~context/enums";

declare global {
    namespace Entities {
        type Team = Team.Contract;

        namespace Team {
            interface Contract {
                id: string;
                createdAt: Date;
                updatedAt?: Date;
                archivedAt?: Date;
                version: number;

                description: string;
                status: TeamStatus;
                name: string;

                lead?: Entities.TeamAccountAssignment;
                organization: Entities.Organization;
                department: Entities.Department;

                assignments: ORM.Collection<Entities.TeamAccountAssignment>;

                assignLead(props: AssignLead.Props): void;
                update(props: ChangeDataProps): void;
                unassignLead(): void;
                canPurge(): void;
                restore(): void;
                archive(): void;
            }

            type ConstructorProps = {
                organization: Entities.Organization;
                department: Entities.Department;
                description: string;
                name: string;
            };

            namespace AssignLead {
                type Props = {
                    assignment: Entities.TeamAccountAssignment;
                };
            }

            type MutableFields = Pick<Contract, "name" | "description">;

            type ChangeDataProps = {
                patch: Partial<MutableFields>;
            };
        }
    }
}
