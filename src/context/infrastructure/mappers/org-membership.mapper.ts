import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { OrgMembershipStatus } from "~context/enums";

export class OrgMembershipMapper implements Repositories.Mappers.Contract<
    Entities.OrgMembership,
    Repositories.Mappers.OrgMembership.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.OrgMembership.Filters,
        basic: ORM.ObjectQuery<Entities.OrgMembership> = {},
    ): ORM.ObjectQuery<Entities.OrgMembership> {
        const where: ORM.ObjectQuery<Entities.OrgMembership> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.account) {
            where.account = ORMAdapter.applyStringFilter(filters.account);
        }
        if (filters.status) {
            where.status = ORMAdapter.applyStringFilter<OrgMembershipStatus>(filters.status);
        }
        if (filters.suspendedAt) {
            where.suspendedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.suspendedAt);
        }
        if (filters.blockedAt) {
            where.blockedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.blockedAt);
        }
        if (filters.updatedAt) {
            where.updatedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.updatedAt);
        }
        if (filters.createdAt) {
            where.createdAt = ORMAdapter.applyOrdinalFilter<Date>(filters.createdAt);
        }
        if (filters.joinedAt) {
            where.joinedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.joinedAt);
        }
        if (filters.leftAt) {
            where.leftAt = ORMAdapter.applyOrdinalFilter<Date>(filters.leftAt);
        }

        return where;
    }

    public buildOptionsORM<P extends string = never, F extends string = "*">(
        sort: Repositories.Mappers.OrgMembership.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.OrgMembership, P, F> = {},
    ): ORM.FindOptions<Entities.OrgMembership, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.OrgMembership>(sort, {
                createdAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
