declare namespace Repositories {
    namespace Organization {
        interface Contract extends Repositories.Base.Contract<
            Entities.Organization,
            Repositories.Mappers.Organization.Types
        > {
            getLookupList: GetLookupList.Signature;
            findDependents: FindDependents.Signature;
        }

        namespace FindDependents {
            type Props = { identifiers: string[]; transaction: ORM.EntityManager };

            type Result = Promise<
                (
                    | Entities.ProjectAccountAssignment
                    | Entities.DeptAccountAssignment
                    | Entities.TeamAccountAssignment
                    | Entities.Invite
                    | Entities.Team
                    | Entities.Department
                    | Entities.Project
                    | Entities.OrgMembership
                )[]
            >;

            type Signature = (props: Props) => Result;
        }

        interface QueryContract extends Pick<Contract, "getLookupList" | "findUniqueOrThrow" | "findMany"> {}

        namespace GetLookupList {
            type Props = {
                prefilter?: ORM.Prefilter<Entities.Organization>;
                pagination: Pagination;
                term: string;
            };

            type Result = Promise<[Entities.Organization[], number]>;

            type Signature = (props: Props) => Result;
        }
    }
}
