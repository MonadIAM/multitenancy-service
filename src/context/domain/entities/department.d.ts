import { DepartmentStatus } from "~context/enums";

declare global {
    namespace Entities {
        type Department = Department.Contract;

        namespace Department {
            interface Contract {
                id: string;
                createdAt: Date;
                updatedAt?: Date;
                archivedAt?: Date;
                version: number;

                organization: Entities.Organization;
                manager?: Entities.DeptAccountAssignment;
                description: string;
                name: string;
                status: DepartmentStatus;

                assignManager(props: AssignManager.Props): void;
                update(props: ChangeDataProps): void;
                unassignManager(): void;
                canPurge(): void;
                restore(): void;
                archive(): void;
            }

            type ConstructorProps = {
                organization: Entities.Organization;
                description: string;
                name: string;
            };

            namespace AssignManager {
                type Props = { assignment: Entities.DeptAccountAssignment };
            }

            type MutableFields = Pick<Contract, "name" | "description">;

            type ChangeDataProps = {
                patch: Partial<MutableFields>;
            };
        }
    }
}
