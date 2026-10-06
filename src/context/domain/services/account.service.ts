import { Inject, Injectable, Scope } from "@nestjs/common";
import { LockMode } from "@mikro-orm/core";

import { Exception } from "~common/exceptions";
import {
    ORG_MEMBERSHIP_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    INVITE_REPOSITORY,
} from "~context/infrastructure/repositories";

import { ORGANIZATION_SERVICE, ORG_MEMBERSHIP_SERVICE } from "./tokens";

@Injectable({ scope: Scope.DEFAULT })
export class AccountService implements Services.Account.Contract {
    public constructor(
        @Inject(ORGANIZATION_SERVICE)
        private readonly organizationService: Services.Organization.CommandContract,
        @Inject(ORG_MEMBERSHIP_SERVICE)
        private readonly membershipService: Services.OrgMembership.CommandContract,
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.OrgMembership.Contract,
        @Inject(INVITE_REPOSITORY)
        private readonly inviteRepository: Repositories.Invite.Contract,
    ) {}

    public async purge(props: Services.Account.Purge.Props): Services.Account.Purge.Result {
        const { account, transaction } = props;
        const affected = await this.organizationRepository.find({
            where: { memberships: { $some: { account } } },
            options: {
                lockMode: LockMode.PESSIMISTIC_WRITE,
                orderBy: { id: "ASC" },
                refresh: true,
            },
            transaction,
        });

        const memberships = await this.membershipRepository.find({
            options: { refresh: true, disableIdentityMap: true },
            where: { account },
            transaction,
        });

        const identifiers = new Set(memberships.map(({ id }) => id));

        if (affected.some(({ pendingOwner }) => pendingOwner && identifiers.has(pendingOwner))) {
            throw Exception.conflict({ messageKey: "services.account.TRANSFER_PENDING" });
        } else {
            const { organizations, realms } = await this.organizationService.purgeOwned({ account, transaction });
            const excludedOrganizations = organizations.map(({ id }) => id);

            const [{ access }, invites] = await Promise.all([
                this.membershipService.clean({ account, excludedOrganizations, transaction }),
                this.inviteRepository.find({
                    where: {
                        organization: { $nin: excludedOrganizations },
                        $or: [{ inviter: account }, { invitee: account }],
                    },
                    transaction,
                }),
            ]);

            transaction.remove(invites);

            return { realms, access };
        }
    }
}
