import { QueryMode, ResponseViewType } from "~context/enums";

declare global {
    namespace Queries {
        namespace Department {
            interface Contract extends PublicContract, InternalContract {}

            interface PublicContract {
                getLookupList: GetLookupList.Signature;
                findUnique: FindUnique.Signature;
                findMany: FindMany.Signature;
            }

            interface InternalContract {
                buildReadScope: BuildReadScope.Signature;
            }

            namespace BuildReadScope {
                type Props = {
                    permissions: string[];
                    actor: string;
                    realm: string;
                };

                type Result = ORM.Prefilter<Entities.Department>;

                type Signature = (props: Props) => Result;
            }

            namespace FindUnique {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    view: ResponseViewType;
                    permissions: string[];
                    department: string;
                    realm: string;
                    actor: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    view: ResponseViewType;
                    department: string;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<Entities.Department>;

                type Signature = (props: Props) => Result;
            }

            namespace FindMany {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    filters: Repositories.Mappers.Department.Filters;
                    sort: Repositories.Mappers.Department.Sort;
                    pagination: Pagination;
                    view: ResponseViewType;
                    permissions: string[];
                    realm: string;
                    actor: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    filters: Repositories.Mappers.Department.Filters;
                    sort: Repositories.Mappers.Department.Sort;
                    pagination: Pagination;
                    view: ResponseViewType;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<[Entities.Department[], number]>;

                type Signature = (props: Props) => Result;
            }

            namespace GetLookupList {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    pagination: Pagination;
                    organization?: string;
                    permissions: string[];
                    actor: string;
                    realm: string;
                    term: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    pagination: Pagination;
                    organization?: string;
                    term: string;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<[Entities.Department[], number]>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
