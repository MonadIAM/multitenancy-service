import { describe, expect, it } from "@jest/globals";

import { DepartmentQueriesUnitHelpers } from "~testing/unit/query-services/department.helpers";
import { QueryMode, ResponseViewType } from "~context/enums";
import { PublicLinkOperator, PublicStringOperator } from "~infrastructure/database/enums";

const ORGANIZATION = "organization-a";
const REALM = "realm-a";
const ID = "entity-a";
const PAGINATION: Pagination = { currentPage: 2, elementsPerPage: 10 };
const helpers = new DepartmentQueriesUnitHelpers();

describe("DepartmentQueries", () => {
    it("scopes single reads by organization and realm", async () => {
        const { queries, departmentRepository: repository } = helpers.queries();
        repository.findUniqueOrThrow.mockResolvedValue(helpers.createDepartment());
        const props = { organization: ORGANIZATION, realm: REALM, view: ResponseViewType.COMPACT };

        await queries.findUnique({ ...props, department: ID });

        expect(repository.findUniqueOrThrow.mock.calls).toEqual([
            [expect.objectContaining({ where: { id: ID, organization: { id: ORGANIZATION, realm: REALM } } })],
        ]);
    });

    it("scopes list reads by organization and realm", async () => {
        const { queries, departmentRepository: repository } = helpers.queries();
        const props = { organization: ORGANIZATION, realm: REALM, view: ResponseViewType.COMPACT };

        await queries.findMany({ ...props, mode: QueryMode.DEFAULT, pagination: PAGINATION, filters: {}, sort: {} });

        expect(repository.findMany.mock.calls).toEqual([
            [expect.objectContaining({ prefilter: { organization: { id: ORGANIZATION, realm: REALM } }, filters: {} })],
        ]);
    });

    it("allows management lists to select organization as a filter without a realm prefilter", async () => {
        const { queries, departmentRepository: repository } = helpers.queries();
        const filters = { organization: { operator: PublicLinkOperator.EQUAL, value: ORGANIZATION } };

        await queries.findMany({
            mode: QueryMode.MANAGE,
            view: ResponseViewType.COMPACT,
            pagination: PAGINATION,
            filters,
            sort: {},
        });

        expect(repository.findMany.mock.calls).toEqual([[expect.objectContaining({ prefilter: undefined, filters })]]);
    });

    it("passes the required realm to graph reads", async () => {
        const { queries, departmentRepository: repository } = helpers.queries();
        const scope = { organization: ORGANIZATION, realm: REALM };

        await queries.getHierarchyGraph(scope);

        expect(repository.getHierarchyGraph.mock.calls).toEqual([[scope]]);
    });

    it("passes the required realm to lookup reads", async () => {
        const { queries, departmentRepository: repository } = helpers.queries();
        const props = { organization: ORGANIZATION, realm: REALM, pagination: PAGINATION, term: "search" };

        await queries.getLookupList(props);

        expect(repository.getLookupList.mock.calls).toEqual([[props]]);
    });

    describe.each([ResponseViewType.COMPACT, ResponseViewType.DETAILED])("view %s", (view) => {
        it.each(["ancestors", "descendants"] as const)("passes filters, scope and populate for %s", async (direction) => {
            const { queries, departmentRepository: repository } = helpers.queries();
            const filters = { name: { operator: PublicStringOperator.EQUAL, value: "Department" } };
            const scope = { organization: ORGANIZATION, realm: REALM, pagination: PAGINATION, filters };
            const populate = view === ResponseViewType.DETAILED ? ["organization"] : [];

            if (direction === "ancestors") {
                await queries.findAncestors({ ...scope, descendant: ID, view });
            } else {
                await queries.findDescendants({ ...scope, ancestor: ID, view });
            }

            if (direction === "ancestors") {
                expect(repository.findAncestors.mock.calls).toEqual([[{ ...scope, descendant: ID, populate }]]);
            } else {
                expect(repository.findDescendants.mock.calls).toEqual([[{ ...scope, ancestor: ID, populate }]]);
            }
        });
    });
});
