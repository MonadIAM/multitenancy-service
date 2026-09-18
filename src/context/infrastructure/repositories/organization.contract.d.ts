declare namespace Repositories {
    namespace Organization {
        interface Contract extends Repositories.Base.Contract<
            Entities.Organization,
            Repositories.Mappers.Organization.Types
        > {
            getLookupList: GetLookupList.Signature;
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
