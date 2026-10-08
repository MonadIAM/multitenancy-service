import { Inject, Injectable, Scope } from "@nestjs/common";

import { MEMBERSHIP_REPOSITORY, ORGANIZATION_REPOSITORY, INVITE_REPOSITORY } from "~context/infrastructure/repositories";
import { OrganizationStatus, MembershipStatus, InviteStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

import { MEMBERSHIP_SERVICE } from "./tokens";
import { Invite } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class InviteService implements Services.Invite.Contract {
    private readonly dictionaryPath = "services.invite";

    public constructor(
        @Inject(MEMBERSHIP_SERVICE)
        private readonly membershipService: Services.Membership.CommandContract,
        @Inject(MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.Membership.Contract,
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(INVITE_REPOSITORY)
        private readonly inviteRepository: Repositories.Invite.Contract,
    ) {}

    public async confirmJoin(props: Services.Invite.ConfirmJoin.Props): Services.Invite.ConfirmJoin.Result {
        const { input, realm, transaction } = props;
        const result = await this.membershipService.confirmJoin(props);

        if (input.invite) {
            const invite = await this.inviteRepository.findUnique({
                where: { id: input.invite, invitee: input.account, organization: { realm } },
                transaction,
            });

            if (invite?.process === input.process && invite.status === InviteStatus.ACCEPTING) {
                invite.confirmAccept();
            }
        }

        return result;
    }

    public async rejectJoin(props: Services.Invite.RejectJoin.Props): Services.Invite.RejectJoin.Result {
        const { input, realm, transaction } = props;
        await this.membershipService.rejectJoin(props);

        if (input.invite) {
            const invite = await this.inviteRepository.findUnique({
                where: { id: input.invite, invitee: input.account, organization: { realm } },
                transaction,
            });

            if (invite?.process === input.process && invite.status === InviteStatus.ACCEPTING) {
                invite.rejectAccept(input.reason);
            }
        }
    }

    public async create(props: Services.Invite.Create.Props): Services.Invite.Create.Result {
        const { transaction, input, realm } = props;
        const [organization, membership] = await Promise.all([
            this.organizationRepository.findUniqueOrThrow({
                where: { id: input.organization, realm, status: OrganizationStatus.ACTIVE },
                transaction,
            }),
            this.membershipRepository.findUnique({
                where: {
                    status: { $ne: MembershipStatus.LEFT },
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

        const membership = await this.membershipService.join({
            input: { organization: entity.organization.id, account: input.invitee },
            transaction,
            realm,
        });

        entity.beginAccept(membership.process!);

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

            entity.cancel();

            return entity;
        }
    }

    public async invalidate(props: Services.Invite.Invalidate.Props): Services.Invite.Invalidate.Result {
        const { transaction, input, realm } = props;

        if (!input.account && !input.organization) {
            throw Exception.badRequest({ messageKey: `${this.dictionaryPath}.INVALIDATION_SCOPE_REQUIRED` });
        } else {
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
    }

    public expire(props: Services.Invite.Expire.Props): Services.Invite.Expire.Result {
        const { transaction, entities, at } = props;

        for (const entity of entities) {
            transaction.merge(entity);
            entity.expire(at);
        }
    }
}
