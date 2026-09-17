import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";

import { DeptAccountAssignment } from "~context/domain/entities";
import { BaseRepository } from "~common/mixins";

import { DeptAccountAssignmentMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class DeptAccountAssignmentRepository
    extends BaseRepository<Entities.DeptAccountAssignment, Repositories.Mappers.DeptAccountAssignment.Types>({
        Mapper: DeptAccountAssignmentMapper,
        Entity: DeptAccountAssignment,
    })
    implements Repositories.DeptAccountAssignment.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }
}
