import { Inject, Injectable, Scope } from "@nestjs/common";

import { DEPARTMENT_REPOSITORY } from "~context/infrastructure/repositories";
import { QueryMode } from "~context/enums";

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
        return this.departmentRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where: {
                id: props.department,
                organization: {
                    id: props.organization,
                    realm: props.realm,
                },
            },
        });
    }

    public findMany(props: Queries.Department.FindMany.Props): Queries.Department.FindMany.Result {
        const prefilter =
            props.mode === QueryMode.DEFAULT ? { organization: { id: props.organization, realm: props.realm } } : undefined;

        return this.departmentRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public getLookupList(props: Queries.Department.GetLookupList.Props): Queries.Department.GetLookupList.Result {
        return this.departmentRepository.getLookupList({
            organization: props.organization,
            pagination: props.pagination,
            realm: props.realm,
            term: props.term,
        });
    }

    public getHierarchyGraph(
        props: Queries.Department.GetHierarchyGraph.Props,
    ): Queries.Department.GetHierarchyGraph.Result {
        return this.departmentRepository.getHierarchyGraph({
            organization: props.organization,
            realm: props.realm,
        });
    }

    public findAncestors(props: Queries.Department.FindAncestors.Props): Queries.Department.FindAncestors.Result {
        return this.departmentRepository.findAncestors({
            organization: props.organization,
            populate: this.populate[props.view],
            filters: props.filters,
            descendant: props.descendant,
            pagination: props.pagination,
            realm: props.realm,
        });
    }

    public findDescendants(props: Queries.Department.FindDescendants.Props): Queries.Department.FindDescendants.Result {
        return this.departmentRepository.findDescendants({
            organization: props.organization,
            populate: this.populate[props.view],
            filters: props.filters,
            ancestor: props.ancestor,
            pagination: props.pagination,
            realm: props.realm,
        });
    }
}
