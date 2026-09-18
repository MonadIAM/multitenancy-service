import { Inject, Injectable, Scope } from "@nestjs/common";

import { OrganizationStatus, OrgMembershipStatus, InviteStatus } from "~context/enums";
import { Exception } from "~common/exceptions";
import {
    ORG_MEMBERSHIP_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    INVITE_REPOSITORY,
} from "~context/infrastructure/repositories";

import { ORG_MEMBERSHIP_SERVICE } from "./tokens";
import { Invite } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class InviteService implements Services.Invite.Contract {
    private readonly dictionaryPath = "services.invite";

    public constructor(
        @Inject(ORG_MEMBERSHIP_SERVICE)
        private readonly membershipService: Services.OrgMembership.CommandContract,
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.OrgMembership.Contract,
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(INVITE_REPOSITORY)
        private readonly inviteRepository: Repositories.Invite.Contract,
    ) {}

    public async create(props: Services.Invite.Create.Props): Services.Invite.Create.Result {
        const { transaction, input, realm } = props;
        const [organization, membership] = await Promise.all([
            this.organizationRepository.findUniqueOrThrow({
                where: { id: input.organization, realm, status: OrganizationStatus.ACTIVE },
                transaction,
            }),
            this.membershipRepository.findUnique({
                where: {
                    status: { $ne: OrgMembershipStatus.LEFT },
                    organization: input.organization,
                    account: input.invitee,
                },
                transaction,
            }),
        ]);

        if (membership) {
            throw Exception.conflict({ messageKey: `${this.dictionaryPath}.INVITEE_ALREADY_MEMBER` });
        } else {
            const entity = new Invite({ ...input, organization });
            transaction.persist(entity);

            return entity;
        }
    }

    public async accept(props: Services.Invite.Accept.Props): Services.Invite.Accept.Result {
        const { transaction, input, realm } = props;
        const entity = await this.inviteRepository.findUniqueOrThrow({
            where: { id: input.invite, invitee: input.invitee, organization: { realm } },
            transaction,
        });

        entity.accept();
        const membership = await this.membershipService.join({
            input: { organization: entity.organization.id, account: input.invitee },
            transaction,
            realm,
        });

        return { membership, invite: entity };
    }

    public async decline(props: Services.Invite.Decline.Props): Services.Invite.Decline.Result {
        const { transaction, input, realm } = props;
        const entity = await this.inviteRepository.findUniqueOrThrow({
            where: { id: input.invite, invitee: input.invitee, organization: { realm } },
            transaction,
        });

        entity.decline();

        return entity;
    }

    public async cancel(props: Services.Invite.Cancel.Props): Services.Invite.Cancel.Result {
        const { transaction, input, realm } = props;

        if (input.inviter) {
            const entity = await this.inviteRepository.findUniqueOrThrow({
                where: { id: input.invite, inviter: input.inviter, organization: { realm } },
                transaction,
            });

            entity.cancel();

            return entity;
        } else {
            const entity = await this.inviteRepository.findUniqueOrThrow({
                where: { id: input.invite, organization: { realm } },
                transaction,
            });

            if (entity.status === InviteStatus.PENDING) {
                entity.cancel();
            }

            return entity;
        }
    }

    public async invalidate(props: Services.Invite.Invalidate.Props): Services.Invite.Invalidate.Result {
        const { transaction, input, realm } = props;

        if (!input.account && !input.organization) {
            throw Exception.badRequest({ messageKey: `${this.dictionaryPath}.INVALIDATION_SCOPE_REQUIRED` });
        }

        const entities = await this.inviteRepository.find({
            where: {
                organization: {
                    realm,
                    ...(input.organization ? { id: input.organization } : {}),
                },
                status: InviteStatus.PENDING,
                ...(input.account ? { $or: [{ invitee: input.account }, { inviter: input.account }] } : {}),
            },
            transaction,
        });

        for (const entity of entities) {
            entity.invalidate();
        }

        return entities;
    }

    public expire(props: Services.Invite.Expire.Props): Services.Invite.Expire.Result {
        const { transaction, entities, at } = props;

        for (const entity of entities) {
            transaction.merge(entity);
            entity.expire(at);
        }
    }
}
