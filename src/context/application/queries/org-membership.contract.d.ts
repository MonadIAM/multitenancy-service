import { QueryMode, ResponseViewType } from "~context/enums";

declare global {
    namespace Queries {
        namespace OrgMembership {
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

                type Result = ORM.Prefilter<Entities.OrgMembership>;

                type Signature = (props: Props) => Result;
            }

            namespace FindUnique {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    view: ResponseViewType;
                    permissions: string[];
                    membership: string;
                    realm: string;
                    actor: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    view: ResponseViewType;
                    membership: string;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<Entities.OrgMembership>;

                type Signature = (props: Props) => Result;
            }

            namespace FindMany {
                type DefaultProps = {
                    mode: QueryMode.DEFAULT;
                    filters: Repositories.Mappers.OrgMembership.Filters;
                    sort: Repositories.Mappers.OrgMembership.Sort;
                    pagination: Pagination;
                    view: ResponseViewType;
                    permissions: string[];
                    realm: string;
                    actor: string;
                };

                type ManageProps = {
                    mode: QueryMode.MANAGE;
                    filters: Repositories.Mappers.OrgMembership.Filters;
                    sort: Repositories.Mappers.OrgMembership.Sort;
                    pagination: Pagination;
                    view: ResponseViewType;
                };

                type Props = DefaultProps | ManageProps;

                type Result = Promise<[Entities.OrgMembership[], number]>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
