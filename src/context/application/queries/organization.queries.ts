import { Inject, Injectable, Scope } from "@nestjs/common";

import { OrgMembershipStatus, PermissionCode, QueryMode } from "~context/enums";
import { ORGANIZATION_REPOSITORY } from "~context/infrastructure/repositories";

@Injectable({ scope: Scope.DEFAULT })
export class OrganizationQueries implements Queries.Organization.Contract {
    private readonly populate = {
        DETAILED: ["owner"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.QueryContract,
    ) {}

    public findUnique(props: Queries.Organization.FindUnique.Props): Queries.Organization.FindUnique.Result {
        const where: ORM.Prefilter<Entities.Organization> = {
            id: props.organization,
        };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.organizationRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.Organization.FindMany.Props): Queries.Organization.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.Organization> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope({ actor: props.actor }));
        }

        return this.organizationRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public getLookupList(props: Queries.Organization.GetLookupList.Props): Queries.Organization.GetLookupList.Result {
        const prefilter = props.mode === QueryMode.DEFAULT ? this.buildReadScope({ actor: props.actor }) : undefined;

        return this.organizationRepository.getLookupList({
            pagination: props.pagination,
            term: props.term,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.Organization.BuildReadScope.Props): Queries.Organization.BuildReadScope.Result {
        return props.permissions?.includes(PermissionCode.ORGANIZATION_READ_ABSOLUTE)
            ? {}
            : {
                  memberships: {
                      status: { $in: [OrgMembershipStatus.ACTIVE, OrgMembershipStatus.SUSPENDED] },
                      account: props.actor,
                  },
              };
    }
}
