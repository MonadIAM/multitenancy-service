import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { MembershipStatus } from "~context/enums";

export class MembershipMapper implements Repositories.Mappers.Contract<
    Entities.Membership,
    Repositories.Mappers.Membership.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.Membership.Filters,
        basic: ORM.Prefilter<Entities.Membership> = {},
    ): ORM.Prefilter<Entities.Membership> {
        const where: ORM.Prefilter<Entities.Membership> = basic;

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
            where.status = ORMAdapter.applyStringFilter<MembershipStatus>(filters.status);
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
        sort: Repositories.Mappers.Membership.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.Membership, P, F> = {},
    ): ORM.FindOptions<Entities.Membership, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.Membership>(sort, {
                createdAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
