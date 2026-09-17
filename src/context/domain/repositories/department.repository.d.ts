declare namespace Repositories {
    namespace Department {
        interface Contract extends Repositories.Base.Contract<Entities.Department, Repositories.Mappers.Department.Types> {
            getLookupList: GetLookupList.Signature;
        }

        interface QueryContract extends Pick<Contract, "getLookupList" | "findUniqueOrThrow" | "findMany"> {}

        namespace GetLookupList {
            type Props = {
                organization?: string;
                pagination: Pagination;
                term: string;
            };

            type Result = Promise<[Entities.Department[], number]>;

            type Signature = (props: Props) => Result;
        }
    }
}
