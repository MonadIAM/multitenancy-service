import { Inject, Injectable, Scope } from "@nestjs/common";

import { OrgMembershipStatus, DepartmentStatus } from "~context/enums";
import { Exception } from "~common/exceptions";
import {
    DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    ORG_MEMBERSHIP_REPOSITORY,
    DEPARTMENT_REPOSITORY,
} from "~context/infrastructure/repositories";

import { DeptAccountAssignment } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class DeptAccountAssignmentService implements Services.DeptAccountAssignment.Contract {
    private readonly dictionaryPath = "services.dept-account-assignment";

    public constructor(
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly assignmentRepository: Repositories.DeptAccountAssignment.Contract,
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.OrgMembership.Contract,
        @Inject(DEPARTMENT_REPOSITORY)
        private readonly departmentRepository: Repositories.Department.Contract,
    ) {}

    public async create(props: Services.DeptAccountAssignment.Create.Props): Services.DeptAccountAssignment.Create.Result {
        const { transaction, input, actor, realm } = props;
        const [membership, department] = await Promise.all([
            this.membershipRepository.findUniqueOrThrow({
                where: {
                    id: input.membership,
                    organization: { realm },
                    status: OrgMembershipStatus.ACTIVE,
                },
                transaction,
            }),
            this.departmentRepository.findUniqueOrThrow({
                where: {
                    id: input.department,
                    organization: { realm },
                    status: DepartmentStatus.ACTIVE,
                },
                transaction,
            }),
        ]);

        if (membership.organization.id === department.organization.id) {
            const entity = new DeptAccountAssignment({ membership, department, assignedBy: actor });
            transaction.persist(entity);

            return entity;
        } else {
            throw Exception.invariantViolation({ messageKey: `${this.dictionaryPath}.ORGANIZATION_MISMATCH` });
        }
    }

    public async revoke(props: Services.DeptAccountAssignment.Revoke.Props): Services.DeptAccountAssignment.Revoke.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.assignmentRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.ASSIGNMENTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.revoke();
            }

            return entities;
        }
    }

    public async restore(
        props: Services.DeptAccountAssignment.Restore.Props,
    ): Services.DeptAccountAssignment.Restore.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.assignmentRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.ASSIGNMENTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.restore();
            }

            return entities;
        }
    }

    public async purge(props: Services.DeptAccountAssignment.Purge.Props): Services.DeptAccountAssignment.Purge.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.assignmentRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.ASSIGNMENTS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.canPurge();
                transaction.remove(entity);
            }

            return entities;
        }
    }

    public async clean(props: Services.DeptAccountAssignment.Clean.Props): Services.DeptAccountAssignment.Clean.Result {
        const { transaction, memberships } = props;
        const entities = await this.assignmentRepository.find({
            where: { membership: { id: { $in: memberships } } },
            transaction,
        });

        for (const entity of entities) {
            transaction.remove(entity);
        }

        return entities;
    }
}
