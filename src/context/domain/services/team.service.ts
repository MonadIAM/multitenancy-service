import { Inject, Injectable, Scope } from "@nestjs/common";

import { AssignmentStatus, DepartmentStatus } from "~context/enums";
import { Exception } from "~common/exceptions";
import {
    TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY,
    DEPARTMENT_REPOSITORY,
    TEAM_REPOSITORY,
} from "~context/infrastructure/repositories";

import { Team } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class TeamService implements Services.Team.Contract {
    private readonly dictionaryPath = "services.team";

    public constructor(
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly assignmentRepository: Repositories.TeamAccountAssignment.Contract,
        @Inject(DEPARTMENT_REPOSITORY)
        private readonly departmentRepository: Repositories.Department.Contract,
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: Repositories.Team.Contract,
    ) {}

    public async create(props: Services.Team.Create.Props): Services.Team.Create.Result {
        const { transaction, input, realm } = props;
        const department = await this.departmentRepository.findUniqueOrThrow({
            where: { id: input.department, organization: { realm }, status: DepartmentStatus.ACTIVE },
            options: { populate: ["organization"] },
            transaction,
        });
        const entity = new Team({
            organization: department.organization,
            description: input.description,
            department,
            name: input.name,
        });

        transaction.persist(entity);

        return entity;
    }

    public async update(props: Services.Team.Update.Props): Services.Team.Update.Result {
        const { transaction, patch, realm, id } = props;
        const entity = await this.teamRepository.findUniqueOrThrow({
            where: { id, organization: { realm } },
            transaction,
        });

        entity.update({ patch });
    }

    public async changeLead(props: Services.Team.ChangeLead.Props): Services.Team.ChangeLead.Result {
        const { transaction, assignment, realm, id } = props;
        const [team, lead] = await Promise.all([
            this.teamRepository.findUniqueOrThrow({
                where: { id, organization: { realm } },
                transaction,
            }),
            assignment
                ? this.assignmentRepository.findUniqueOrThrow({
                      where: { id: assignment, team: id, status: AssignmentStatus.ACTIVE },
                      transaction,
                  })
                : null,
        ]);

        if (lead) {
            team.assignLead({ assignment: lead });
        } else {
            team.unassignLead();
        }

        return team;
    }

    public async archive(props: Services.Team.Archive.Props): Services.Team.Archive.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.teamRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.TEAMS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.archive();
            }

            return entities;
        }
    }

    public async restore(props: Services.Team.Restore.Props): Services.Team.Restore.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.teamRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.TEAMS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.restore();
            }

            return entities;
        }
    }

    public async purge(props: Services.Team.Purge.Props): Services.Team.Purge.Result {
        const { transaction, identifiers, realm } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.teamRepository.find({
            where: { id: { $in: unique }, organization: { realm } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.TEAMS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.canPurge();
                transaction.remove(entity);
            }

            return entities;
        }
    }
}
