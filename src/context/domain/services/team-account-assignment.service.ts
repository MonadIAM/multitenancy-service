import { Inject, Injectable, Scope } from "@nestjs/common";

import { OrgMembershipStatus, TeamStatus } from "~context/enums";
import { Exception } from "~common/exceptions";
import {
    TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY,
    ORG_MEMBERSHIP_REPOSITORY,
    TEAM_REPOSITORY,
} from "~context/infrastructure/repositories";

import { TeamAccountAssignment } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class TeamAccountAssignmentService implements Services.TeamAccountAssignment.Contract {
    private readonly dictionaryPath = "services.team-account-assignment";

    public constructor(
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly assignmentRepository: Repositories.TeamAccountAssignment.Contract,
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.OrgMembership.Contract,
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: Repositories.Team.Contract,
    ) {}

    public async create(props: Services.TeamAccountAssignment.Create.Props): Services.TeamAccountAssignment.Create.Result {
        const { transaction, input, actor, realm } = props;
        const [membership, team] = await Promise.all([
            this.membershipRepository.findUniqueOrThrow({
                where: {
                    id: input.membership,
                    organization: { realm },
                    status: OrgMembershipStatus.ACTIVE,
                },
                transaction,
            }),
            this.teamRepository.findUniqueOrThrow({
                where: { id: input.team, organization: { realm }, status: TeamStatus.ACTIVE },
                transaction,
            }),
        ]);

        if (membership.organization.id === team.organization.id) {
            const entity = new TeamAccountAssignment({ membership, team, assignedBy: actor });
            transaction.persist(entity);

            return entity;
        } else {
            throw Exception.invariantViolation({ messageKey: `${this.dictionaryPath}.ORGANIZATION_MISMATCH` });
        }
    }

    public async revoke(props: Services.TeamAccountAssignment.Revoke.Props): Services.TeamAccountAssignment.Revoke.Result {
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
        props: Services.TeamAccountAssignment.Restore.Props,
    ): Services.TeamAccountAssignment.Restore.Result {
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

    public async purge(props: Services.TeamAccountAssignment.Purge.Props): Services.TeamAccountAssignment.Purge.Result {
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

    public async clean(props: Services.TeamAccountAssignment.Clean.Props): Services.TeamAccountAssignment.Clean.Result {
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
