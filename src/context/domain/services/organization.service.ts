import { Inject, Injectable, Scope } from "@nestjs/common";

import { ORG_MEMBERSHIP_REPOSITORY, ORGANIZATION_REPOSITORY } from "~context/infrastructure/repositories";
import { OrgMembershipStatus } from "~context/enums";
import { Exception } from "~common/exceptions";

import { OrgMembership, Organization } from "../entities";

@Injectable({ scope: Scope.DEFAULT })
export class OrganizationService implements Services.Organization.Contract {
    private readonly dictionaryPath = "services.organization";

    public constructor(
        @Inject(ORGANIZATION_REPOSITORY)
        private readonly organizationRepository: Repositories.Organization.Contract,
        @Inject(ORG_MEMBERSHIP_REPOSITORY)
        private readonly membershipRepository: Repositories.OrgMembership.Contract,
    ) {}

    public create(props: Services.Organization.Create.Props): Services.Organization.Create.Result {
        const { transaction, input, actor } = props;
        const organization = new Organization({ ...input });
        const membership = new OrgMembership({ organization, account: actor });

        organization.transferOwnership({ membership });
        transaction.persist(organization);
        transaction.persist(membership);

        return { organization, membership };
    }

    public async update(props: Services.Organization.Update.Props): Services.Organization.Update.Result {
        const { transaction, patch, id } = props;
        const entity = await this.organizationRepository.findUniqueOrThrow({
            where: { id },
            transaction,
        });

        entity.update({ patch });
    }

    public async transferOwnership(
        props: Services.Organization.TransferOwnership.Props,
    ): Services.Organization.TransferOwnership.Result {
        const { transaction, membership, id } = props;
        const [organization, owner] = await Promise.all([
            this.organizationRepository.findUniqueOrThrow({
                where: { id },
                transaction,
            }),
            this.membershipRepository.findUniqueOrThrow({
                where: { id: membership, organization: id, status: OrgMembershipStatus.ACTIVE },
                transaction,
            }),
        ]);

        organization.transferOwnership({ membership: owner });

        return organization;
    }

    public async revoke(props: Services.Organization.Revoke.Props): Services.Organization.Revoke.Result {
        const { transaction, identifiers } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.organizationRepository.find({
            where: { id: { $in: unique } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.ORGANIZATIONS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.revoke();
            }

            return entities;
        }
    }

    public async restore(props: Services.Organization.Restore.Props): Services.Organization.Restore.Result {
        const { transaction, identifiers } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.organizationRepository.find({
            where: { id: { $in: unique } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.ORGANIZATIONS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.restore();
            }

            return entities;
        }
    }

    public async purge(props: Services.Organization.Purge.Props): Services.Organization.Purge.Result {
        const { transaction, identifiers } = props;
        const unique = Array.from(new Set(identifiers));
        const entities = await this.organizationRepository.find({
            where: { id: { $in: unique } },
            transaction,
        });

        if (entities.length < unique.length) {
            throw Exception.notFound({ messageKey: `${this.dictionaryPath}.ORGANIZATIONS_NOT_FOUND` });
        } else {
            for (const entity of entities) {
                entity.canPurge();
                transaction.remove(entity);
            }

            return entities;
        }
    }
}
