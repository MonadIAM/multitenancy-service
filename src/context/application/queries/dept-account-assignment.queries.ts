import { Inject, Injectable, Scope } from "@nestjs/common";

import { DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class DeptAccountAssignmentQueries implements Queries.DeptAccountAssignment.Contract {
    private readonly populate = {
        DETAILED: ["organization", "membership", "department"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY)
        private readonly deptAccountAssignmentRepository: Repositories.DeptAccountAssignment.QueryContract,
    ) {}

    public findUnique(
        props: Queries.DeptAccountAssignment.FindUnique.Props,
    ): Queries.DeptAccountAssignment.FindUnique.Result {
        const where: ORM.Prefilter<Entities.DeptAccountAssignment> = {
            id: props.assignment,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.deptAccountAssignmentRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.DeptAccountAssignment.FindMany.Props): Queries.DeptAccountAssignment.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.DeptAccountAssignment> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.deptAccountAssignmentRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public buildReadScope(
        props: Queries.DeptAccountAssignment.BuildReadScope.Props,
    ): Queries.DeptAccountAssignment.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.DeptAccountAssignment> = {};

        if (props.permissions.includes(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_COMMON)) {
                prefilter.$or.push({ organization: { realm: props.realm } });
            }

            if (props.permissions.includes(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_PERSONAL)) {
                prefilter.$or.push({ membership: { account: props.actor } });
            }

            return prefilter;
        }
    }
}
