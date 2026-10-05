import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { DepartmentStatus } from "~context/enums";

export class DepartmentMapper implements Repositories.Mappers.Contract<
    Entities.Department,
    Repositories.Mappers.Department.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.Department.Filters,
        basic: ORM.Prefilter<Entities.Department> = {},
    ): ORM.Prefilter<Entities.Department> {
        const where: ORM.Prefilter<Entities.Department> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.managerPosition) {
            where.managerPosition = ORMAdapter.applyStringFilter(filters.managerPosition);
        }
        if (filters.name) {
            where.name = ORMAdapter.applyStringFilter(filters.name);
        }
        if (filters.status) {
            where.status = ORMAdapter.applyStringFilter<DepartmentStatus>(filters.status);
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
        sort: Repositories.Mappers.Department.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.Department, P, F> = {},
    ): ORM.FindOptions<Entities.Department, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.Department>(sort, {
                createdAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
