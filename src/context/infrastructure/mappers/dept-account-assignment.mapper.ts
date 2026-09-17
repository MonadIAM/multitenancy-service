import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { AssignmentStatus } from "~context/enums";

export class DeptAccountAssignmentMapper implements Repositories.Mappers.Contract<
    Entities.DeptAccountAssignment,
    Repositories.Mappers.DeptAccountAssignment.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.DeptAccountAssignment.Filters,
        basic: ORM.ObjectQuery<Entities.DeptAccountAssignment> = {},
    ): ORM.ObjectQuery<Entities.DeptAccountAssignment> {
        const where: ORM.ObjectQuery<Entities.DeptAccountAssignment> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.account) {
            where.membership = { account: ORMAdapter.applyStringFilter(filters.account) };
        }
        if (filters.department) {
            where.department = { id: ORMAdapter.applyStringFilter(filters.department) };
        }
        if (filters.assignedBy) {
            where.assignedBy = ORMAdapter.applyStringFilter(filters.assignedBy);
        }
        if (filters.status) {
            where.status = ORMAdapter.applyStringFilter<AssignmentStatus>(filters.status);
        }
        if (filters.assignedAt) {
            where.assignedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.assignedAt);
        }
        if (filters.updatedAt) {
            where.updatedAt = ORMAdapter.applyOrdinalFilter<Date>(filters.updatedAt);
        }

        return where;
    }

    public buildOptionsORM<P extends string = never, F extends string = "*">(
        sort: Repositories.Mappers.DeptAccountAssignment.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.DeptAccountAssignment, P, F> = {},
    ): ORM.FindOptions<Entities.DeptAccountAssignment, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.DeptAccountAssignment>(sort, {
                assignedAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
