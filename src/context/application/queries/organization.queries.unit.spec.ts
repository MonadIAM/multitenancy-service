import { describe, expect, it } from "@jest/globals";

import { OrganizationQueriesUnitHelpers } from "~testing/unit/query-services/organization.helpers";
import { QueryMode, ResponseViewType, PermissionCode, MembershipStatus } from "~context/enums";

const ACTOR = "actor-account";
const ID = "entity-a";
const PAGINATION: Pagination = { currentPage: 2, elementsPerPage: 10 };
const helpers = new OrganizationQueriesUnitHelpers();

describe("OrganizationQueries", () => {
    describe("findMany / getLookupList", () => {
        it.each([
            {
                mode: QueryMode.DEFAULT,
                expected: {
                    memberships: {
                        account: ACTOR,
                        status: { $in: [MembershipStatus.ACTIVE, MembershipStatus.SUSPENDED] },
                    },
                },
            },
            { mode: QueryMode.MANAGE, expected: {} },
        ])("%s selects organizations and lookups visible to the actor", async ({ mode, expected }) => {
            const { queries, organizationRepository: repository } = helpers.queries();
            repository.findMany.mockResolvedValue([[], 0]);
            repository.getLookupList.mockResolvedValue([[], 0]);

            await queries.findMany({
                mode,
                actor: ACTOR,
                view: ResponseViewType.COMPACT,
                pagination: PAGINATION,
                filters: {},
                sort: {},
            });
            await queries.getLookupList({ mode, actor: ACTOR, pagination: PAGINATION, term: "org" });

            expect(repository.findMany.mock.calls).toEqual([[expect.objectContaining({ prefilter: expected })]]);
            expect(repository.getLookupList.mock.calls).toEqual([
                [expect.objectContaining({ prefilter: mode === QueryMode.DEFAULT ? expected : undefined })],
            ]);
        });
    });

    describe("findUnique", () => {
        it.each([false, true])("absolute read permission=%s controls single organization access", async (absolute) => {
            const { queries, organizationRepository } = helpers.queries();
            organizationRepository.findUniqueOrThrow.mockResolvedValue(helpers.createOrganization());
            const expected = absolute
                ? { id: ID }
                : {
                      id: ID,
                      memberships: {
                          account: ACTOR,
                          status: { $in: [MembershipStatus.ACTIVE, MembershipStatus.SUSPENDED] },
                      },
                  };

            await queries.findUnique({
                mode: QueryMode.DEFAULT,
                actor: ACTOR,
                organization: ID,
                permissions: absolute ? [PermissionCode.ORGANIZATION_READ_ABSOLUTE] : [],
                view: ResponseViewType.COMPACT,
            });

            expect(organizationRepository.findUniqueOrThrow.mock.calls).toEqual([
                [expect.objectContaining({ where: expected })],
            ]);
        });
    });
});
