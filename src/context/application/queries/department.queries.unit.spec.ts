import { describe, expect, it } from "@jest/globals";

import { DepartmentQueriesUnitHelpers } from "~testing/unit/query-services/department.helpers";
import { QueryMode, ResponseViewType, PermissionCode, OrgMembershipStatus, AssignmentStatus } from "~context/enums";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ID = "entity-a";
const PAGINATION: Pagination = { currentPage: 2, elementsPerPage: 10 };
const helpers = new DepartmentQueriesUnitHelpers();

describe("DepartmentQueries", () => {
    it.each([
        { name: "no read permission", permissions: [], expected: { $or: [] } },
        {
            name: "personal",
            permissions: [PermissionCode.DEPARTMENT_READ_PERSONAL],
            expected: {
                $or: [
                    {
                        assignments: {
                            membership: {
                                status: { $in: [OrgMembershipStatus.ACTIVE, OrgMembershipStatus.SUSPENDED] },
                                account: ACTOR,
                            },
                            status: AssignmentStatus.ACTIVE,
                        },
                    },
                ],
            },
        },
        {
            name: "common",
            permissions: [PermissionCode.DEPARTMENT_READ_COMMON],
            expected: { $or: [{ organization: { realm: REALM } }] },
        },
        {
            name: "combined",
            permissions: [PermissionCode.DEPARTMENT_READ_COMMON, PermissionCode.DEPARTMENT_READ_PERSONAL],
            expected: {
                $or: [
                    ...[{ organization: { realm: REALM } }],
                    {
                        assignments: {
                            membership: {
                                status: { $in: [OrgMembershipStatus.ACTIVE, OrgMembershipStatus.SUSPENDED] },
                                account: ACTOR,
                            },
                            status: AssignmentStatus.ACTIVE,
                        },
                    },
                ],
            },
        },
        {
            name: "absolute",
            permissions: [PermissionCode.DEPARTMENT_READ_ABSOLUTE, PermissionCode.DEPARTMENT_READ_PERSONAL],
            expected: {},
        },
    ])("applies $name visibility to single and paged reads", async ({ permissions, expected }) => {
        const { queries, departmentRepository: repository } = helpers.queries();
        const entity = helpers.createDepartment();
        repository.findUniqueOrThrow.mockResolvedValue(entity);
        repository.findMany.mockResolvedValue([[entity], 1]);

        await queries.findUnique({
            mode: QueryMode.DEFAULT,
            view: ResponseViewType.COMPACT,
            actor: ACTOR,
            realm: REALM,
            permissions,
            department: ID,
        });
        await queries.findMany({
            mode: QueryMode.DEFAULT,
            view: ResponseViewType.COMPACT,
            actor: ACTOR,
            realm: REALM,
            permissions,
            pagination: PAGINATION,
            filters: {},
            sort: {},
        });

        expect(repository.findUniqueOrThrow.mock.calls).toEqual([
            [expect.objectContaining({ where: { id: ID, ...expected } })],
        ]);
        expect(repository.findMany.mock.calls).toEqual([[expect.objectContaining({ prefilter: expected })]]);
    });

    it("uses management scope without imposing the caller's membership", async () => {
        const { queries, departmentRepository: repository } = helpers.queries();
        repository.findMany.mockResolvedValue([[], 0]);
        repository.findUniqueOrThrow.mockResolvedValue(helpers.createDepartment());

        await queries.findUnique({ mode: QueryMode.MANAGE, view: ResponseViewType.COMPACT, department: ID });
        await queries.findMany({
            mode: QueryMode.MANAGE,
            view: ResponseViewType.COMPACT,
            pagination: PAGINATION,
            filters: {},
            sort: {},
        });

        expect(repository.findUniqueOrThrow.mock.calls).toEqual([[expect.objectContaining({ where: { id: ID } })]]);
        expect(repository.findMany.mock.calls).toEqual([[expect.objectContaining({ prefilter: {} })]]);
    });

    it.each([QueryMode.DEFAULT, QueryMode.MANAGE])("%s scopes lookup results as well as ordinary lists", async (mode) => {
        const { queries, departmentRepository: repository } = helpers.queries();
        repository.getLookupList.mockResolvedValue([[], 0]);

        await queries.getLookupList({
            mode,
            actor: ACTOR,
            realm: REALM,
            organization: "organization-a",
            permissions: [],
            pagination: PAGINATION,
            term: "search",
        });

        expect(repository.getLookupList.mock.calls).toEqual([
            [
                expect.objectContaining({
                    organization: "organization-a",
                    term: "search",
                    prefilter: mode === QueryMode.DEFAULT ? { $or: [] } : undefined,
                }),
            ],
        ]);
    });
});
