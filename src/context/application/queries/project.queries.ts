import { Inject, Injectable, Scope } from "@nestjs/common";

import { AssignmentStatus, OrgMembershipStatus, PermissionCode, QueryMode } from "~context/enums";
import { PROJECT_REPOSITORY } from "~context/infrastructure/repositories";

@Injectable({ scope: Scope.DEFAULT })
export class ProjectQueries implements Queries.Project.Contract {
    private readonly populate = {
        DETAILED: ["organization", "manager.membership"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: Repositories.Project.QueryContract,
    ) {}

    public findUnique(props: Queries.Project.FindUnique.Props): Queries.Project.FindUnique.Result {
        const where: ORM.Prefilter<Entities.Project> = { id: props.project };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.projectRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.Project.FindMany.Props): Queries.Project.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.Project> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.projectRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public getLookupList(props: Queries.Project.GetLookupList.Props): Queries.Project.GetLookupList.Result {
        const prefilter = props.mode === QueryMode.DEFAULT ? this.buildReadScope(props) : undefined;

        return this.projectRepository.getLookupList({
            organization: props.organization,
            pagination: props.pagination,
            term: props.term,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.Project.BuildReadScope.Props): Queries.Project.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.Project> = {};

        if (props.permissions.includes(PermissionCode.PROJECT_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.PROJECT_READ_COMMON)) {
                prefilter.$or.push({ realm: props.realm });
            }

            if (props.permissions.includes(PermissionCode.PROJECT_READ_PERSONAL)) {
                prefilter.$or.push({
                    assignments: {
                        status: AssignmentStatus.ACTIVE,
                        membership: {
                            status: { $in: [OrgMembershipStatus.ACTIVE, OrgMembershipStatus.SUSPENDED] },
                            account: props.actor,
                        },
                    },
                });
            }

            return prefilter;
        }
    }
}
