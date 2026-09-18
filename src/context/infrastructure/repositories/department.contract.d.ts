declare namespace Repositories {
    namespace Department {
        interface Contract extends Repositories.Base.Contract<Entities.Department, Repositories.Mappers.Department.Types> {
            getLookupList: GetLookupList.Signature;
        }

        interface QueryContract extends Pick<Contract, "getLookupList" | "findUniqueOrThrow" | "findMany"> {}

        namespace GetLookupList {
            type Props = {
                prefilter?: ORM.Prefilter<Entities.Department>;
                pagination: Pagination;
                organization?: string;
                term: string;
            };

            type Result = Promise<[Entities.Department[], number]>;

            type Signature = (props: Props) => Result;
        }
    }
}
