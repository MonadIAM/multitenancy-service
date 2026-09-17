import { QueryMode, ResponseViewType } from "~context/enums";

declare global {
    namespace Queries {
        namespace DeptAccountAssignment {
            interface Contract extends PublicContract, InternalContract {}

            interface PublicContract {
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

                type Result = ORM.Prefilter<Entities.DeptAccountAssignment>;

                type Signature = (props: Props) => Result;
            }

            namespace FindUnique {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    view: ResponseViewType;
                    permissions: string[];
                    assignment: string;
                    realm: string;
                    actor: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    view: ResponseViewType;
                    assignment: string;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<Entities.DeptAccountAssignment>;

                type Signature = (props: Props) => Result;
            }

            namespace FindMany {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    filters: Repositories.Mappers.DeptAccountAssignment.Filters;
                    sort: Repositories.Mappers.DeptAccountAssignment.Sort;
                    pagination: Pagination;
                    view: ResponseViewType;
                    permissions: string[];
                    realm: string;
                    actor: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    filters: Repositories.Mappers.DeptAccountAssignment.Filters;
                    sort: Repositories.Mappers.DeptAccountAssignment.Sort;
                    pagination: Pagination;
                    view: ResponseViewType;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<[Entities.DeptAccountAssignment[], number]>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
