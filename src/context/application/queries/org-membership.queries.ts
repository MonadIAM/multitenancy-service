import { Inject, Injectable, Scope } from "@nestjs/common";

import { ORG_MEMBERSHIP_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class OrgMembershipQueries implements Queries.OrgMembership.Contract {
    private readonly populate = {
        DETAILED: ["organization"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly orgMembershipRepository: Repositories.OrgMembership.QueryContract,
    ) {}

    public findUnique(props: Queries.OrgMembership.FindUnique.Props): Queries.OrgMembership.FindUnique.Result {
        const where: ORM.Prefilter<Entities.OrgMembership> = {
            id: props.membership,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.orgMembershipRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.OrgMembership.FindMany.Props): Queries.OrgMembership.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.OrgMembership> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.orgMembershipRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.OrgMembership.BuildReadScope.Props): Queries.OrgMembership.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.OrgMembership> = {};

        if (props.permissions.includes(PermissionCode.MEMBERSHIP_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.MEMBERSHIP_READ_COMMON)) {
                prefilter.$or.push({ organization: { realm: props.realm } });
            }

            if (props.permissions.includes(PermissionCode.MEMBERSHIP_READ_PERSONAL)) {
                prefilter.$or.push({ account: props.actor });
            }

            return prefilter;
        }
    }
}
