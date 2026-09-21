import { describe, expect, it } from "@jest/globals";

import { OrgMembershipQueriesUnitHelpers } from "~testing/unit/query-services/org-membership.helpers";
import { QueryMode, ResponseViewType, PermissionCode } from "~context/enums";

const ACTOR = "actor-account";
const REALM = "realm-a";
const ID = "entity-a";
const PAGINATION: Pagination = { currentPage: 2, elementsPerPage: 10 };
const helpers = new OrgMembershipQueriesUnitHelpers();

describe("OrgMembershipQueries", () => {
    it.each([
        { name: "no read permission", permissions: [], expected: { $or: [] } },
        {
            name: "personal",
            permissions: [PermissionCode.MEMBERSHIP_READ_PERSONAL],
            expected: { $or: [{ account: ACTOR }] },
        },
        {
            name: "common",
            permissions: [PermissionCode.MEMBERSHIP_READ_COMMON],
            expected: { $or: [{ organization: { realm: REALM } }] },
        },
        {
            name: "combined",
            permissions: [PermissionCode.MEMBERSHIP_READ_COMMON, PermissionCode.MEMBERSHIP_READ_PERSONAL],
            expected: { $or: [...[{ organization: { realm: REALM } }], { account: ACTOR }] },
        },
        {
            name: "absolute",
            permissions: [PermissionCode.MEMBERSHIP_READ_ABSOLUTE, PermissionCode.MEMBERSHIP_READ_PERSONAL],
            expected: {},
        },
    ])("applies $name visibility to single and paged reads", async ({ permissions, expected }) => {
        const { queries, orgMembershipRepository: repository } = helpers.queries();
        const entity = helpers.createOrgMembership();
        repository.findUniqueOrThrow.mockResolvedValue(entity);
        repository.findMany.mockResolvedValue([[entity], 1]);

        await queries.findUnique({
            mode: QueryMode.DEFAULT,
            view: ResponseViewType.COMPACT,
            actor: ACTOR,
            realm: REALM,
            permissions,
            membership: ID,
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
        const { queries, orgMembershipRepository: repository } = helpers.queries();
        repository.findMany.mockResolvedValue([[], 0]);
        repository.findUniqueOrThrow.mockResolvedValue(helpers.createOrgMembership());

        await queries.findUnique({ mode: QueryMode.MANAGE, view: ResponseViewType.COMPACT, membership: ID });
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
