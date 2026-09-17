import { Inject, Injectable, Scope } from "@nestjs/common";

import { PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class ProjectAccountAssignmentQueries implements Queries.ProjectAccountAssignment.Contract {
    private readonly populate = {
        DETAILED: ["organization", "membership", "project"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly projectAccountAssignmentRepository: Repositories.ProjectAccountAssignment.QueryContract,
    ) {}

    public findUnique(
        props: Queries.ProjectAccountAssignment.FindUnique.Props,
    ): Queries.ProjectAccountAssignment.FindUnique.Result {
        const where: ORM.Prefilter<Entities.ProjectAccountAssignment> = {
            id: props.assignment,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.projectAccountAssignmentRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(
        props: Queries.ProjectAccountAssignment.FindMany.Props,
    ): Queries.ProjectAccountAssignment.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.ProjectAccountAssignment> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.projectAccountAssignmentRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public buildReadScope(
        props: Queries.ProjectAccountAssignment.BuildReadScope.Props,
    ): Queries.ProjectAccountAssignment.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.ProjectAccountAssignment> = {};

        if (props.permissions.includes(PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_COMMON)) {
                prefilter.$or.push({ project: { realm: props.realm } });
            }

            if (props.permissions.includes(PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_PERSONAL)) {
                prefilter.$or.push({ membership: { account: props.actor } });
            }

            return prefilter;
        }
    }
}
