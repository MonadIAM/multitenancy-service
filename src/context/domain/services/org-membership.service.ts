import { Inject, Injectable, Scope } from "@nestjs/common";

import { ORG_MEMBERSHIP_REPOSITORY, ORGANIZATION_REPOSITORY } from "~context/infrastructure/repositories";
import { OrganizationStatus, OrgMembershipStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

import { OrgMembership } from "../entities";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_SERVICE,
    DEPT_ACCOUNT_ASSIGNMENT_SERVICE,
    TEAM_ACCOUNT_ASSIGNMENT_SERVICE,
} from "./tokens";

@Injectable({ scope: Scope.DEFAULT })
export class OrgMembershipService implements Services.OrgMembership.Contract {
    private readonly dictionaryPath = "services.org-membership";

    public constructor(
        @Inject(PROJECT_ACCOUNT_ASSIGNMENT_SERVICE)
        private readonly projectAssignmentService: Services.ProjectAccountAssignment.InternalContract,
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_SERVICE)
        private readonly departmentAssignmentService: Services.DeptAccountAssignment.InternalContract,
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_SERVICE)
        private readonly teamAssignmentService: Services.TeamAccountAssignment.InternalContract,
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.OrgMembership.Contract,
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
    ) {}

    public async join(props: Services.OrgMembership.Join.Props): Services.OrgMembership.Join.Result {
        const { transaction, input, realm } = props;
        const [organization, existing] = await Promise.all([
            this.organizationRepository.findUniqueOrThrow({
                where: { id: input.organization, realm, status: OrganizationStatus.ACTIVE },
                transaction,
            }),
            this.membershipRepository.findUnique({
                where: { organization: input.organization, account: input.account },
                transaction,
            }),
        ]);

        if (existing) {
            if (existing.status === OrgMembershipStatus.LEFT) {
                existing.activate();

                return existing;
            } else {
                throw Exception.conflict({ messageKey: `${this.dictionaryPath}.MEMBERSHIP_ALREADY_EXISTS` });
            }
        } else {
            const entity = new OrgMembership({ organization, account: input.account });
            transaction.persist(entity);

            return entity;
        }
    }

    public async suspend(props: Services.OrgMembership.Suspend.Props): Services.OrgMembership.Suspend.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.membershipRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.MEMBERSHIPS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.suspend();
            }

            return entities;
        }
    }

    public async resume(props: Services.OrgMembership.Resume.Props): Services.OrgMembership.Resume.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.membershipRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.MEMBERSHIPS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.activate();
            }

            return entities;
        }
    }

    public async leave(props: Services.OrgMembership.Leave.Props): Services.OrgMembership.Leave.Result {
        const { transaction, identifiers, account, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.membershipRepository.find({
            where: { id: { $in: unique }, organization: { realm }, account },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.MEMBERSHIPS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.leave();
            }

            const membershipIdentifiers = entities.map(({ id }) => id);
            const [projectAssignments, departmentAssignments, teamAssignments] = await Promise.all([
                this.projectAssignmentService.clean({ memberships: membershipIdentifiers, transaction }),
                this.departmentAssignmentService.clean({ memberships: membershipIdentifiers, transaction }),
                this.teamAssignmentService.clean({ memberships: membershipIdentifiers, transaction }),
            ]);

            return {
                memberships: entities,
                assignments: {
                    department: departmentAssignments,
                    project: projectAssignments,
                    team: teamAssignments,
                },
            };
        }
    }

    public async block(props: Services.OrgMembership.Block.Props): Services.OrgMembership.Block.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.membershipRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.MEMBERSHIPS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.block();
            }

            const membershipIdentifiers = entities.map(({ id }) => id);
            const [projectAssignments, departmentAssignments, teamAssignments] = await Promise.all([
                this.projectAssignmentService.clean({ memberships: membershipIdentifiers, transaction }),
                this.departmentAssignmentService.clean({ memberships: membershipIdentifiers, transaction }),
                this.teamAssignmentService.clean({ memberships: membershipIdentifiers, transaction }),
            ]);

            return {
                memberships: entities,
                assignments: {
                    department: departmentAssignments,
                    project: projectAssignments,
                    team: teamAssignments,
                },
            };
        }
    }
}
