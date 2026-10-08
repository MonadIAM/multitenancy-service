import { Inject, Injectable, Scope } from "@nestjs/common";

import { MEMBERSHIP_REPOSITORY } from "~context/infrastructure/repositories";
import { PermissionCode, QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class MembershipQueries implements Queries.Membership.Contract {
    private readonly populate = {
        DETAILED: ["organization"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.Membership.QueryContract,
    ) {}

    public findUnique(props: Queries.Membership.FindUnique.Props): Queries.Membership.FindUnique.Result {
        const where: ORM.Prefilter<Entities.Membership> = {
            id: props.membership,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.membershipRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.Membership.FindMany.Props): Queries.Membership.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.Membership> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.membershipRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.Membership.BuildReadScope.Props): Queries.Membership.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.Membership> = {};

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
