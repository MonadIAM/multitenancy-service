import { ProjectStatus } from "~context/enums";

declare global {
    namespace Entities {
        type Project = Project.Contract;

        namespace Project {
            interface Contract {
                id: string;
                createdAt: Date;
                updatedAt?: Date;
                archivedAt?: Date;
                version: number;

                manager?: Entities.ProjectAccountAssignment;
                organization: Entities.Organization;
                status: ProjectStatus;
                description: string;
                realm: string;
                name: string;

                assignManager(props: AssignManager.Props): void;
                update(props: ChangeDataProps): void;
                unassignManager(): void;
                canPurge(): void;
                restore(): void;
                archive(): void;
            }

            type ConstructorProps = {
                organization: Entities.Organization;
                realm: string;
                description: string;
                name: string;
            };

            namespace AssignManager {
                type Props = { assignment: Entities.ProjectAccountAssignment };
            }

            type MutableFields = Pick<Contract, "name" | "description">;

            type ChangeDataProps = {
                patch: Partial<MutableFields>;
            };
        }
    }
}
