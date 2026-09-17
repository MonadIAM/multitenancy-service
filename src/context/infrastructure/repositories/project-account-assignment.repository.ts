import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";

import { ProjectAccountAssignment } from "~context/domain/entities";
import { BaseRepository } from "~common/mixins";

import { ProjectAccountAssignmentMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class ProjectAccountAssignmentRepository
    extends BaseRepository<Entities.ProjectAccountAssignment, Repositories.Mappers.ProjectAccountAssignment.Types>({
        Mapper: ProjectAccountAssignmentMapper,
        Entity: ProjectAccountAssignment,
    })
    implements Repositories.ProjectAccountAssignment.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }
}
