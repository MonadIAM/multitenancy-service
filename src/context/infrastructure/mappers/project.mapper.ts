import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { ProjectStatus } from "~context/enums";

export class ProjectMapper implements Repositories.Mappers.Contract<Entities.Project, Repositories.Mappers.Project.Types> {
    public buildWhereORM(
        filters: Repositories.Mappers.Project.Filters,
        basic: ORM.Prefilter<Entities.Project> = {},
    ): ORM.Prefilter<Entities.Project> {
        const where: ORM.Prefilter<Entities.Project> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.manager) {
            where.manager = { id: ORMAdapter.applyStringFilter(filters.manager) };
        }
        if (filters.realm) {
            where.realm = ORMAdapter.applyStringFilter(filters.realm);
        }
        if (filters.name) {
            where.name = ORMAdapter.applyStringFilter(filters.name);
        }
        if (filters.status) {
            where.status = ORMAdapter.applyStringFilter<ProjectStatus>(filters.status);
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
        sort: Repositories.Mappers.Project.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.Project, P, F> = {},
    ): ORM.FindOptions<Entities.Project, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.Project>(sort, {
                createdAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
