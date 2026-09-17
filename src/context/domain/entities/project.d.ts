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

                status: ProjectStatus;
                description: string;
                realm: string;
                name: string;

                manager?: Entities.ProjectAccountAssignment;
                organization: Entities.Organization;

                assignments: ORM.Collection<Entities.ProjectAccountAssignment>;

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
                type Props = {
                    assignment: Entities.ProjectAccountAssignment;
                };
            }

            type MutableFields = Pick<Contract, "name" | "description">;

            type ChangeDataProps = {
                patch: Partial<MutableFields>;
            };
        }
    }
}
