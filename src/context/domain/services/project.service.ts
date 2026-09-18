import { Inject, Injectable, Scope } from "@nestjs/common";

import { AssignmentStatus, OrganizationStatus } from "~context/enums";
import { Exception } from "~common/exceptions";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    PROJECT_REPOSITORY,
} from "~context/infrastructure/repositories";

import { Project } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class ProjectService implements Services.Project.Contract {
    private readonly dictionaryPath = "services.project";

    public constructor(
        @Inject(PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly assignmentRepository: Repositories.ProjectAccountAssignment.Contract,
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: Repositories.Project.Contract,
    ) {}

    public async create(props: Services.Project.Create.Props): Services.Project.Create.Result {
        const { transaction, input } = props;
        const organization = await this.organizationRepository.findUniqueOrThrow({
            where: { id: input.organization, realm: input.realm, status: OrganizationStatus.ACTIVE },
            transaction,
        });
        const entity = new Project({
            organization,
            description: input.description,
            realm: input.realm,
            name: input.name,
        });

        transaction.persist(entity);

        return entity;
    }

    public async update(props: Services.Project.Update.Props): Services.Project.Update.Result {
        const { transaction, patch, realm, id } = props;
        const entity = await this.projectRepository.findUniqueOrThrow({
            where: { id, realm },
            transaction,
        });

        entity.update({ patch });
    }

    public async assignManager(props: Services.Project.AssignManager.Props): Services.Project.AssignManager.Result {
        const { transaction, assignment, realm, id } = props;
        const [project, manager] = await Promise.all([
            this.projectRepository.findUniqueOrThrow({ where: { id, realm }, transaction }),
            this.assignmentRepository.findUniqueOrThrow({
                where: { id: assignment, project: id, status: AssignmentStatus.ACTIVE },
                transaction,
            }),
        ]);

        project.assignManager({ assignment: manager });

        return project;
    }

    public async unassignManager(props: Services.Project.UnassignManager.Props): Services.Project.UnassignManager.Result {
        const { transaction, realm, id } = props;
        const entity = await this.projectRepository.findUniqueOrThrow({
            where: { id, realm },
            transaction,
        });

        entity.unassignManager();

        return entity;
    }

    public async archive(props: Services.Project.Archive.Props): Services.Project.Archive.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.projectRepository.find({
            where: { id: { $in: unique }, realm },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.PROJECTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.archive();
            }

            return entities;
        }
    }

    public async restore(props: Services.Project.Restore.Props): Services.Project.Restore.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.projectRepository.find({
            where: { id: { $in: unique }, realm },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.PROJECTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.restore();
            }

            return entities;
        }
    }

    public async purge(props: Services.Project.Purge.Props): Services.Project.Purge.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.projectRepository.find({
            where: { id: { $in: unique }, realm },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.PROJECTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.canPurge();
                transaction.remove(entity);
            }

            return entities;
        }
    }
}
