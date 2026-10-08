import { Inject, Injectable, Scope } from "@nestjs/common";
import { LockMode } from "@mikro-orm/core";

import { Exception } from "~common/exceptions";
import { MoveMode } from "~context/enums";
import {
    DEPARTMENT_CLOSURE_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    DEPARTMENT_REPOSITORY,
} from "~context/infrastructure/repositories";

import { Department } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentService implements Services.Department.Contract {
    private readonly dictionaryPath = "services.department";

    public constructor(
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(DEPARTMENT_REPOSITORY)
        private readonly departmentRepository: Repositories.Department.Contract,
        @Inject(DEPARTMENT_CLOSURE_REPOSITORY)
        private readonly closureRepository: Repositories.DepartmentClosure.Contract,
    ) {}

    public async create(props: Services.Department.Create.Props): Services.Department.Create.Result {
        const { transaction, organization, input, realm } = props;

        const [organizationEntity, parentEntity] = await Promise.all([
            this.organizationRepository.findUniqueOrThrow({
                options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                where: { id: organization, realm },
                transaction,
            }),
            input.parent
                ? await this.departmentRepository.findUniqueOrThrow({
                      where: { id: input.parent, organization },
                      transaction,
                  })
                : undefined,
        ]);

        const entity = new Department({
            organization: organizationEntity,
            description: input.description,
            name: input.name,
        });

        transaction.persist(entity);
        await transaction.flush();

        await this.buildHierarchy({
            transaction,
            input: {
                children: input.children,
                parent: parentEntity,
                organization,
                entity,
            },
        });

        return entity;
    }

    public async buildHierarchy(
        props: Services.Department.BuildHierarchy.Props,
    ): Services.Department.BuildHierarchy.Result {
        const { input, transaction } = props;
        await this.closureRepository.insertNewHierarchy({
            organization: input.organization,
            descendant: input.entity.id,
            ancestor: input.parent?.id,
            transaction,
        });

        if (input.children?.length) {
            const descendants = input.parent
                ? await this.departmentRepository.getDescendants({
                      where: { organization: input.organization },
                      ancestor: input.parent.id,
                      transaction,
                      depth: 1,
                  })
                : await this.departmentRepository.find({
                      where: {
                          id: { $in: input.children },
                          organization: input.organization,
                      },
                      transaction,
                  });

            const descendantsSet = new Set(descendants.map(({ id }) => id));

            for (const child of input.children) {
                if (!descendantsSet.has(child)) {
                    throw Exception.invariantViolation({
                        messageKey: `${this.dictionaryPath}.CREATE_CHILD_NOT_DIRECT_DESCENDANT`,
                    });
                }
            }

            if (!input.parent) {
                const ancestors = await this.departmentRepository.getAncestors({
                    where: { organization: input.organization },
                    descendant: { $in: input.children },
                    transaction,
                    depth: 1,
                });

                if (ancestors.length) {
                    throw Exception.invariantViolation({
                        messageKey: `${this.dictionaryPath}.CREATE_CHILD_NOT_DIRECT_DESCENDANT`,
                    });
                }
            }

            await this.closureRepository.moveSubtrees({
                children: [...new Set(input.children)],
                oldParent: input.parent?.id ?? null,
                organization: input.organization,
                newParent: input.entity.id,
                transaction,
            });
        }
    }

    public async move(props: Services.Department.Move.Props): Services.Department.Move.Result {
        const { transaction, organization, realm, mode } = props;
        await this.organizationRepository.findUniqueOrThrow({
            where: { id: organization, realm },
            options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
            transaction,
        });

        const [target, targetParent] = await Promise.all([
            this.departmentRepository.findUniqueOrThrow({
                where: { id: props.target, organization },
                transaction,
            }),
            props.targetParent
                ? this.departmentRepository.findUniqueOrThrow({
                      where: { id: props.targetParent, organization },
                      transaction,
                  })
                : undefined,
        ]);

        if (targetParent?.id === target.id) {
            throw Exception.invariantViolation({ messageKey: `${this.dictionaryPath}.REPARENT_TARGET_IS_SELF` });
        }

        const [[currentParent], wouldFormCycle] = await Promise.all([
            this.departmentRepository.getAncestors({
                descendant: target.id,
                where: { organization },
                transaction,
                depth: 1,
            }),
            mode === MoveMode.SUBTREE && targetParent
                ? this.closureRepository.existsTransitivePath({
                      descendant: targetParent.id,
                      ancestor: target.id,
                      organization,
                      transaction,
                  })
                : false,
        ]);

        if ((currentParent?.id ?? null) === (targetParent?.id ?? null)) {
            throw Exception.invariantViolation({ messageKey: `${this.dictionaryPath}.REPARENT_TARGET_ALREADY_PARENT` });
        }

        if (mode === MoveMode.SUBTREE && wouldFormCycle) {
            throw Exception.invariantViolation({ messageKey: `${this.dictionaryPath}.REPARENT_TARGET_IN_SUBTREE` });
        }

        if (mode === MoveMode.PARALLEL) {
            const directChildren = await this.departmentRepository.getDescendants({
                ancestor: target.id,
                where: { organization },
                transaction,
                depth: 1,
            });

            if (directChildren.length) {
                await this.closureRepository.moveSubtrees({
                    children: directChildren.map(({ id }) => id),
                    newParent: currentParent?.id ?? null,
                    oldParent: target.id,
                    organization,
                    transaction,
                });
            }
        }

        await this.closureRepository.move({
            newParent: targetParent?.id ?? null,
            target: target.id,
            organization,
            transaction,
        });
    }

    public async update(props: Services.Department.Update.Props): Services.Department.Update.Result {
        const { transaction, patch, organization, id } = props;
        const entity = await this.departmentRepository.findUniqueOrThrow({
            where: { id, organization: { id: organization, realm: props.realm } },
            transaction,
        });

        entity.update({ patch });
    }

    public async changeManager(props: Services.Department.ChangeManager.Props): Services.Department.ChangeManager.Result {
        const { transaction, position, organization, id } = props;
        const department = await this.departmentRepository.findUniqueOrThrow({
            options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
            where: { id, organization: { id: organization, realm: props.realm } },
            transaction,
        });

        if (position) {
            department.assignManager({ position });
        } else {
            department.unassignManager();
        }

        return department;
    }

    public async archive(props: Services.Department.Archive.Props): Services.Department.Archive.Result {
        const { transaction, identifiers, organization } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.departmentRepository.find({
            where: {
                id: { $in: unique },
                organization: { id: organization, realm: props.realm },
            },
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
        const { transaction, identifiers, organization } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.departmentRepository.find({
            where: {
                id: { $in: unique },
                organization: { id: organization, realm: props.realm },
            },
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
        const { transaction, organization, realm, id } = props;
        await this.organizationRepository.findUniqueOrThrow({
            where: { id: organization, realm },
            options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
            transaction,
        });

        const entity = await this.departmentRepository.findUniqueOrThrow({
            where: { id, organization },
            transaction,
        });

        entity.assertReady();
        entity.canPurge();

        await this.closureRepository.decreaseTransitiveDepth({
            department: entity.id,
            organization,
            transaction,
        });

        transaction.remove(entity);

        return entity;
    }
}
