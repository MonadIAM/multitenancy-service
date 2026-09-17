import { Inject, Injectable, Scope } from "@nestjs/common";

import { TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class TeamAccountAssignmentQueries implements Queries.TeamAccountAssignment.Contract {
    private readonly populate = {
        DETAILED: ["organization", "membership", "team"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly teamAccountAssignmentRepository: Repositories.TeamAccountAssignment.QueryContract,
    ) {}

    public findUnique(
        props: Queries.TeamAccountAssignment.FindUnique.Props,
    ): Queries.TeamAccountAssignment.FindUnique.Result {
        const where: ORM.Prefilter<Entities.TeamAccountAssignment> = {
            id: props.assignment,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.teamAccountAssignmentRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.TeamAccountAssignment.FindMany.Props): Queries.TeamAccountAssignment.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.TeamAccountAssignment> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.teamAccountAssignmentRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public buildReadScope(
        props: Queries.TeamAccountAssignment.BuildReadScope.Props,
    ): Queries.TeamAccountAssignment.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.TeamAccountAssignment> = {};

        if (props.permissions.includes(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_COMMON)) {
                prefilter.$or.push({ organization: { realm: props.realm } });
            }

            if (props.permissions.includes(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_PERSONAL)) {
                prefilter.$or.push({ membership: { account: props.actor } });
            }

            return prefilter;
        }
    }
}
