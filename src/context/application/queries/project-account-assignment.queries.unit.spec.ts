import { describe, expect, it } from "@jest/globals";

import { ProjectAccountAssignmentQueriesUnitHelpers } from "~testing/unit/query-services/project-account-assignment.helpers";
import { QueryMode, ResponseViewType, PermissionCode } from "~context/enums";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ID = "entity-a";
const PAGINATION: Pagination = { currentPage: 2, elementsPerPage: 10 };
const helpers = new ProjectAccountAssignmentQueriesUnitHelpers();

describe("ProjectAccountAssignmentQueries", () => {
    it.each([
        { name: "no read permission", permissions: [], expected: { $or: [] } },
        {
            name: "personal",
            permissions: [PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_PERSONAL],
            expected: { $or: [{ membership: { account: ACTOR } }] },
        },
        {
            name: "common",
            permissions: [PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_COMMON],
            expected: { $or: [{ project: { realm: REALM } }, { organization: { realm: REALM } }] },
        },
        {
            name: "combined",
            permissions: [
                PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_COMMON,
                PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_PERSONAL,
            ],
            expected: {
                $or: [
                    ...[{ project: { realm: REALM } }, { organization: { realm: REALM } }],
                    { membership: { account: ACTOR } },
                ],
            },
        },
        {
            name: "absolute",
            permissions: [
                PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE,
                PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_PERSONAL,
            ],
            expected: {},
        },
    ])("applies $name visibility to single and paged reads", async ({ permissions, expected }) => {
        const { queries, projectAccountAssignmentRepository: repository } = helpers.queries();
        const entity = helpers.createProjectAccountAssignment();
        repository.findUniqueOrThrow.mockResolvedValue(entity);
        repository.findMany.mockResolvedValue([[entity], 1]);

        await queries.findUnique({
            mode: QueryMode.DEFAULT,
            view: ResponseViewType.COMPACT,
            actor: ACTOR,
            realm: REALM,
            permissions,
            assignment: ID,
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
        const { queries, projectAccountAssignmentRepository: repository } = helpers.queries();
        repository.findMany.mockResolvedValue([[], 0]);
        repository.findUniqueOrThrow.mockResolvedValue(helpers.createProjectAccountAssignment());

        await queries.findUnique({ mode: QueryMode.MANAGE, view: ResponseViewType.COMPACT, assignment: ID });
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
});
