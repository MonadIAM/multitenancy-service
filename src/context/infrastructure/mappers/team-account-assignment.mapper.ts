import { QueryOrder } from "@mikro-orm/postgresql";

import { ORMAdapter } from "~infrastructure/database/utils";
import { AssignmentStatus } from "~context/enums";

export class TeamAccountAssignmentMapper implements Repositories.Mappers.Contract<
    Entities.TeamAccountAssignment,
    Repositories.Mappers.TeamAccountAssignment.Types
> {
    public buildWhereORM(
        filters: Repositories.Mappers.TeamAccountAssignment.Filters,
        basic: ORM.ObjectQuery<Entities.TeamAccountAssignment> = {},
    ): ORM.ObjectQuery<Entities.TeamAccountAssignment> {
        const where: ORM.ObjectQuery<Entities.TeamAccountAssignment> = basic;

        if (filters.id) {
            where.id = ORMAdapter.applyStringFilter(filters.id);
        }
        if (filters.organization) {
            where.organization = { id: ORMAdapter.applyStringFilter(filters.organization) };
        }
        if (filters.account) {
            where.membership = { account: ORMAdapter.applyStringFilter(filters.account) };
        }
        if (filters.team) {
            where.team = { id: ORMAdapter.applyStringFilter(filters.team) };
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
        sort: Repositories.Mappers.TeamAccountAssignment.Sort,
        pagination: Pagination,
        basic: ORM.FindOptions<Entities.TeamAccountAssignment, P, F> = {},
    ): ORM.FindOptions<Entities.TeamAccountAssignment, P, F> {
        return {
            ...basic,
            orderBy: ORMAdapter.orderBy<Entities.TeamAccountAssignment>(sort, {
                assignedAt: QueryOrder.ASC,
            }),
            ...ORMAdapter.pagination(pagination),
        };
    }
}
