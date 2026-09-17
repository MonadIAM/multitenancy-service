import { Inject, Injectable, Scope } from "@nestjs/common";

import { InviteQueryScope, PermissionCode, QueryMode } from "~context/enums";
import { INVITE_REPOSITORY } from "~context/infrastructure/repositories";

@Injectable({ scope: Scope.DEFAULT })
export class InviteQueries implements Queries.Invite.Contract {
    private readonly populate = {
        DETAILED: ["organization"] as const,
        COMPACT: [] as const,
    };

    public constructor(
        @Inject(INVITE_REPOSITORY)
        private readonly inviteRepository: Repositories.Invite.QueryContract,
    ) {}

    public findUnique(props: Queries.Invite.FindUnique.Props): Queries.Invite.FindUnique.Result {
        const where: ORM.Prefilter<Entities.Invite> = { id: props.invite };

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(where, this.buildReadScope(props));
        }

        return this.inviteRepository.findUniqueOrThrow({
            options: { populate: this.populate[props.view] },
            where,
        });
    }

    public findMany(props: Queries.Invite.FindMany.Props): Queries.Invite.FindMany.Result {
        const prefilter: ORM.Prefilter<Entities.Invite> = {};

        if (props.mode === QueryMode.DEFAULT) {
            Object.assign(prefilter, this.buildReadScope(props));
        }

        return this.inviteRepository.findMany({
            options: { populate: this.populate[props.view] },
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }

    public buildReadScope(props: Queries.Invite.BuildReadScope.Props): Queries.Invite.BuildReadScope.Result {
        const prefilter: ORM.Prefilter<Entities.Invite> = {};

        if (props.permissions.includes(PermissionCode.INVITE_READ_ABSOLUTE)) {
            return prefilter;
        } else {
            prefilter.$or = [];

            if (props.permissions.includes(PermissionCode.INVITE_READ_COMMON)) {
                prefilter.$or.push({ organization: { realm: props.realm } });
            }

            if (props.permissions.includes(PermissionCode.INVITE_READ_PERSONAL)) {
                if (props.scope === InviteQueryScope.AS_INVITER) {
                    prefilter.$or.push({ inviter: props.actor });
                } else if (props.scope === InviteQueryScope.AS_INVITEE) {
                    prefilter.$or.push({ invitee: props.actor });
                } else {
                    prefilter.$or.push({ $or: [{ invitee: props.actor }, { inviter: props.actor }] });
                }
            }

            return prefilter;
        }
    }
}
