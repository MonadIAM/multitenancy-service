import { Inject, Injectable, Scope } from "@nestjs/common";

import { TEAM_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class TeamQueries implements Queries.Team.Contract {
    private readonly populate = {
        DETAILED: ["organization", "department"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: Repositories.Team.QueryContract,
    ) {}

    public findUnique(props: Queries.Team.FindUnique.Props): Queries.Team.FindUnique.Result {
        const where: ORM.Prefilter<Entities.Team> = { id: props.team };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.teamRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.Team.FindMany.Props): Queries.Team.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.Team> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.teamRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public getLookupList(props: Queries.Team.GetLookupList.Props): Queries.Team.GetLookupList.Result {
        const prefilter = props.mode === QueryMode.DEFAULT ? this.buildReadScope(props) : undefined;

        return this.teamRepository.getLookupList({
            organization: props.organization,
            department: props.department,
            pagination: props.pagination,
            term: props.term,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.Team.BuildReadScope.Props): Queries.Team.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.Team> = {};

        if (props.permissions.includes(PermissionCode.TEAM_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.TEAM_READ_COMMON)) {
                prefilter.$or.push({ organization: { realm: props.realm } });
            }

            return prefilter;
        }
    }
}
