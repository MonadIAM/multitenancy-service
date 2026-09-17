import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { OrganizationStatus } from "~context/enums";

export class OrganizationMapper implements Repositories.Mappers.Contract<
    Entities.Organization,
    Repositories.Mappers.Organization.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.Organization.Filters,
        basic: ORM.Prefilter<Entities.Organization> = {},
    ): ORM.Prefilter<Entities.Organization> {
        const where: ORM.Prefilter<Entities.Organization> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.owner) {
            where.owner = { id: ORMAdapter.applyStringFilter(filters.owner) };
        }
        if (filters.realm) {
            where.realm = ORMAdapter.applyStringFilter(filters.realm);
        }
        if (filters.title) {
            where.title = ORMAdapter.applyStringFilter(filters.title);
        }
        if (filters.status) {
            where.status = ORMAdapter.applyStringFilter<OrganizationStatus>(filters.status);
        }
        if (filters.revokedAt) {
            where.revokedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.revokedAt);
        }
        if (filters.updatedAt) {
            where.updatedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.updatedAt);
        }
        if (filters.createdAt) {
            where.createdAt = ORMAdapter.applyOrdinalFilter<Date>(filters.createdAt);
        }

        return where;
    }

    public buildOptionsORM<P extends string = never, F extends string = "*">(
        sort: Repositories.Mappers.Organization.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.Organization, P, F> = {},
    ): ORM.FindOptions<Entities.Organization, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.Organization>(sort, {
                createdAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
