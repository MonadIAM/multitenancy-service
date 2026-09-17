import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";

import { OrgMembership } from "~context/domain/entities";
import { BaseRepository } from "~common/mixins";

import { OrgMembershipMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class OrgMembershipRepository
    extends BaseRepository<Entities.OrgMembership, Repositories.Mappers.OrgMembership.Types>({
        Mapper: OrgMembershipMapper,
        Entity: OrgMembership,
    })
    implements Repositories.OrgMembership.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }
}
