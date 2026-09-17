import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { AssignmentStatus } from "~context/enums";

export class ProjectAccountAssignmentMapper implements Repositories.Mappers.Contract<
    Entities.ProjectAccountAssignment,
    Repositories.Mappers.ProjectAccountAssignment.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.ProjectAccountAssignment.Filters,
        basic: ORM.Prefilter<Entities.ProjectAccountAssignment> = {},
    ): ORM.Prefilter<Entities.ProjectAccountAssignment> {
        const where: ORM.Prefilter<Entities.ProjectAccountAssignment> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.account) {
            where.membership = { account: ORMAdapter.applyStringFilter(filters.account) };
        }
        if (filters.project) {
            where.project = { id: ORMAdapter.applyStringFilter(filters.project) };
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
        sort: Repositories.Mappers.ProjectAccountAssignment.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.ProjectAccountAssignment, P, F> = {},
    ): ORM.FindOptions<Entities.ProjectAccountAssignment, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.ProjectAccountAssignment>(sort, { assignedAt: QueryOrder.ASC }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
