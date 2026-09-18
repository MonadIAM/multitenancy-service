import { Inject, Injectable, Scope } from "@nestjs/common";

import { AssignmentStatus, OrganizationStatus } from "~context/enums";
import { Exception } from "~common/exceptions";
import {
    DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    DEPARTMENT_REPOSITORY,
} from "~context/infrastructure/repositories";

import { Department } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentService implements Services.Department.Contract {
    private readonly dictionaryPath = "services.department";

    public constructor(
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly assignmentRepository: Repositories.DeptAccountAssignment.Contract,
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(DEPARTMENT_REPOSITORY)
        private readonly departmentRepository: Repositories.Department.Contract,
    ) {}

    public async create(props: Services.Department.Create.Props): Services.Department.Create.Result {
        const { transaction, input, realm } = props;
        const organization = await this.organizationRepository.findUniqueOrThrow({
            where: { status: OrganizationStatus.ACTIVE, id: input.organization, realm },
            transaction,
        });

        const entity = new Department({
            description: input.description,
            name: input.name,
            organization,
        });

        transaction.persist(entity);

        return entity;
    }

    public async update(props: Services.Department.Update.Props): Services.Department.Update.Result {
        const { transaction, patch, realm, id } = props;
        const entity = await this.departmentRepository.findUniqueOrThrow({
            where: { id, organization: { realm } },
            transaction,
        });

        entity.update({ patch });
    }

    public async changeManager(props: Services.Department.ChangeManager.Props): Services.Department.ChangeManager.Result {
        const { transaction, assignment, realm, id } = props;
        const [department, manager] = await Promise.all([
            this.departmentRepository.findUniqueOrThrow({
                where: { id, organization: { realm } },
                transaction,
            }),
            assignment
                ? this.assignmentRepository.findUniqueOrThrow({
                      where: { status: AssignmentStatus.ACTIVE, id: assignment, department: id },
                      transaction,
                  })
                : null,
        ]);

        if (manager) {
            department.assignManager({ assignment: manager });
        } else {
            department.unassignManager();
        }

        return department;
    }

    public async archive(props: Services.Department.Archive.Props): Services.Department.Archive.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.departmentRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.DEPARTMENTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.archive();
            }

            return entities;
        }
    }

    public async restore(props: Services.Department.Restore.Props): Services.Department.Restore.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.departmentRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.DEPARTMENTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.restore();
            }

            return entities;
        }
    }

    public async purge(props: Services.Department.Purge.Props): Services.Department.Purge.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.departmentRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.DEPARTMENTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.canPurge();
                transaction.remove(entity);
            }

            return entities;
        }
    }
}
