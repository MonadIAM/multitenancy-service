import { Inject, Injectable, Scope } from "@nestjs/common";

import { DEPARTMENT_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentQueries implements Queries.Department.Contract {
    private readonly populate = {
        DETAILED: ["organization"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(DEPARTMENT_REPOSITORY)
        private readonly departmentRepository: Repositories.Department.QueryContract,
    ) {}

    public findUnique(props: Queries.Department.FindUnique.Props): Queries.Department.FindUnique.Result {
        const where: ORM.Prefilter<Entities.Department> = {
            id: props.department,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.departmentRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.Department.FindMany.Props): Queries.Department.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.Department> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.departmentRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public getLookupList(props: Queries.Department.GetLookupList.Props): Queries.Department.GetLookupList.Result {
        const prefilter = props.mode === QueryMode.DEFAULT ? this.buildReadScope(props) : undefined;

        return this.departmentRepository.getLookupList({
            organization: props.organization,
            pagination: props.pagination,
            term: props.term,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.Department.BuildReadScope.Props): Queries.Department.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.Department> = {};

        if (props.permissions.includes(PermissionCode.DEPARTMENT_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.DEPARTMENT_READ_COMMON)) {
                prefilter.$or.push({ organization: { realm: props.realm } });
            }

            return prefilter;
        }
    }
}
