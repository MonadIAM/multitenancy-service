import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";

import { ExceptionMapper } from "~common/exceptions";
import { Invite } from "~context/domain/entities";
import { BaseRepository } from "~common/mixins";
import { InviteStatus } from "~context/enums";

import { InviteMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class InviteRepository
    extends BaseRepository<Entities.Invite, Repositories.Mappers.Invite.Types>({
        Mapper: InviteMapper,
        Entity: Invite,
    })
    implements Repositories.Invite.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
        @InjectEntityManager("write")
        private readonly writeManager: ORM.EntityManager,
    ) {
        super();
    }

    public async findExpiredPending(
        props: Repositories.Invite.FindExpiredPending.Props,
    ): Repositories.Invite.FindExpiredPending.Result {
        try {
            const { expirationDate, batchSize, transaction } = props;
            const entityManager = transaction ?? this.writeManager;

            return await entityManager.find(
                Invite,
                { status: InviteStatus.PENDING, expiresAt: { $lte: expirationDate } },
                { limit: batchSize },
            );
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }
}
