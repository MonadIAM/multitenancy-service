import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";

import { TeamAccountAssignment } from "~context/domain/entities";
import { BaseRepository } from "~common/mixins";

import { TeamAccountAssignmentMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class TeamAccountAssignmentRepository
    extends BaseRepository<Entities.TeamAccountAssignment, Repositories.Mappers.TeamAccountAssignment.Types>({
        Mapper: TeamAccountAssignmentMapper,
        Entity: TeamAccountAssignment,
    })
    implements Repositories.TeamAccountAssignment.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }
}
