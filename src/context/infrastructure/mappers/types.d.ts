import { QueryOrder } from "@mikro-orm/postgresql";

import { LinkFilterDTO, OrdinalFilterDTO, StringFilterDTO } from "~common/dto";

declare global {
    namespace Repositories {
        namespace Mappers {
            type Meta = {
                Filters: unknown;
                Sort: unknown;
            };

            interface Contract<E, A extends Meta> {
                buildWhereORM(filters: A["Filters"], basic?: ORM.ObjectQuery<E>): ORM.FilterQuery<E>;
                buildOptionsORM<P extends string, F extends string>(
                    sort: A["Sort"],
                    pagination: Pagination,
                    options?: ORM.FindOptions<E, P, F>,
                ): ORM.FindOptions<E, P, F>;
            }

            namespace AuditLog {
                type Filters = {
                    id?: StringFilterDTO;
                    realm?: LinkFilterDTO;
                    actor?: LinkFilterDTO;
                    ip?: StringFilterDTO;
                    userAgent?: StringFilterDTO;
                    actionType?: StringFilterDTO;
                    entityType?: StringFilterDTO;
                    createdAt?: OrdinalFilterDTO<Date>;
                };

                type Sort = {
                    createdAt?: QueryOrder;
                    at?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace ChangeLog {
                type Filters = {
                    id?: StringFilterDTO;
                    entity?: StringFilterDTO;
                    changeType?: StringFilterDTO;
                    entityType?: StringFilterDTO;
                    auditEntry?: StringFilterDTO;
                    createdAt?: OrdinalFilterDTO<Date>;
                };

                type Sort = {
                    createdAt?: QueryOrder;
                    at?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace Organization {
                type Filters = {
                    updatedAt?: OrdinalFilterDTO<Date>;
                    createdAt?: OrdinalFilterDTO<Date>;
                    revokedAt?: OrdinalFilterDTO<Date>;
                    status?: StringFilterDTO;
                    owner?: LinkFilterDTO;
                    realm?: LinkFilterDTO;
                    title?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    updatedAt?: QueryOrder;
                    createdAt?: QueryOrder;
                    revokedAt?: QueryOrder;
                    title?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace OrgMembership {
                type Filters = {
                    suspendedAt?: OrdinalFilterDTO<Date>;
                    blockedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    createdAt?: OrdinalFilterDTO<Date>;
                    joinedAt?: OrdinalFilterDTO<Date>;
                    leftAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    account?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    suspendedAt?: QueryOrder;
                    blockedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                    createdAt?: QueryOrder;
                    joinedAt?: QueryOrder;
                    leftAt?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace Invite {
                type Filters = {
                    updatedAt?: OrdinalFilterDTO<Date>;
                    createdAt?: OrdinalFilterDTO<Date>;
                    expiresAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    invitee?: LinkFilterDTO;
                    inviter?: LinkFilterDTO;
                    role?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    updatedAt?: QueryOrder;
                    createdAt?: QueryOrder;
                    expiresAt?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace Project {
                type Filters = {
                    archivedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    createdAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    manager?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    realm?: LinkFilterDTO;
                    name?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    archivedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                    createdAt?: QueryOrder;
                    name?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace ProjectAccountAssignment {
                type Filters = {
                    assignedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    project?: LinkFilterDTO;
                    assignedBy?: LinkFilterDTO;
                    account?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    assignedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace Department {
                type Filters = {
                    archivedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    createdAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    manager?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    name?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    archivedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                    createdAt?: QueryOrder;
                    name?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace DeptAccountAssignment {
                type Filters = {
                    assignedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    department?: LinkFilterDTO;
                    assignedBy?: LinkFilterDTO;
                    account?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    assignedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace Team {
                type Filters = {
                    archivedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    createdAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    department?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    lead?: LinkFilterDTO;
                    name?: StringFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    archivedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                    createdAt?: QueryOrder;
                    name?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }

            namespace TeamAccountAssignment {
                type Filters = {
                    assignedAt?: OrdinalFilterDTO<Date>;
                    updatedAt?: OrdinalFilterDTO<Date>;
                    organization?: LinkFilterDTO;
                    assignedBy?: LinkFilterDTO;
                    account?: LinkFilterDTO;
                    status?: StringFilterDTO;
                    team?: LinkFilterDTO;
                    id?: StringFilterDTO;
                };

                type Sort = {
                    assignedAt?: QueryOrder;
                    updatedAt?: QueryOrder;
                };

                interface Types {
                    Filters: Filters;
                    Sort: Sort;
                }
            }
        }
    }
}
