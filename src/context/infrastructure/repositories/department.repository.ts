import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";
import { raw } from "@mikro-orm/postgresql";

import { Department } from "~context/domain/entities";
import { ExceptionMapper } from "~common/exceptions";
import { BaseRepository } from "~common/mixins";

import { DepartmentMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentRepository
    extends BaseRepository<Entities.Department, Repositories.Mappers.Department.Types>({
        Mapper: DepartmentMapper,
        Entity: Department,
    })
    implements Repositories.Department.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }

    public async getLookupList(
        props: Repositories.Department.GetLookupList.Props,
    ): Repositories.Department.GetLookupList.Result {
        try {
            const { organization, pagination, term } = props;
            const entityManager = this.readManager.fork();
            const builder = entityManager.createQueryBuilder(Department, "d");

            builder
                .select(["d.id", "d.name"])
                .limit(pagination.elementsPerPage)
                .offset((pagination.currentPage - 1) * pagination.elementsPerPage);

            if (organization) {
                builder.where({ "d.organization": organization });
            }

            if (term) {
                builder
                    .andWhere("d.name % ?", [term])
                    .orderBy([{ [raw("similarity(d.name, ?)", [term])]: "DESC" }, { "d.name": "ASC" }, { "d.id": "ASC" }]);
            } else {
                builder.orderBy({ "d.name": "ASC", "d.id": "ASC" });
            }

            return await builder.getResultAndCount();
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }
}
