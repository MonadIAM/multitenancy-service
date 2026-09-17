import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { TeamStatus } from "~context/enums";

export class TeamMapper implements Repositories.Mappers.Contract<Entities.Team, Repositories.Mappers.Team.Types> {
    public buildWhereORM(
        filters: Repositories.Mappers.Team.Filters,
        basic: ORM.Prefilter<Entities.Team> = {},
    ): ORM.Prefilter<Entities.Team> {
        const where: ORM.Prefilter<Entities.Team> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.department) {
            where.department = { id: ORMAdapter.applyStringFilter(filters.department) };
        }
        if (filters.lead) {
            where.lead = { id: ORMAdapter.applyStringFilter(filters.lead) };
        }
        if (filters.name) {
            where.name = ORMAdapter.applyStringFilter(filters.name);
        }
        if (filters.status) {
            where.status = ORMAdapter.applyStringFilter<TeamStatus>(filters.status);
        }
        if (filters.archivedAt) {
            where.archivedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.archivedAt);
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
        sort: Repositories.Mappers.Team.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.Team, P, F> = {},
    ): ORM.FindOptions<Entities.Team, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.Team>(sort, {
                createdAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
