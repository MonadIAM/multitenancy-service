import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";
import { raw } from "@mikro-orm/postgresql";

import { Organization } from "~context/domain/entities";
import { ExceptionMapper } from "~common/exceptions";
import { BaseRepository } from "~common/mixins";

import { OrganizationMapper } from "../mappers";

@Injectable({ scope: Scope.DEFAULT })
export class OrganizationRepository
    extends BaseRepository<Entities.Organization, Repositories.Mappers.Organization.Types>({
        Mapper: OrganizationMapper,
        Entity: Organization,
    })
    implements Repositories.Organization.Contract
{
    public constructor(
        @InjectEntityManager("read")
        protected readonly readManager: ORM.EntityManager,
    ) {
        super();
    }

    public async getLookupList(
        props: Repositories.Organization.GetLookupList.Props,
    ): Repositories.Organization.GetLookupList.Result {
        try {
            const { pagination, term } = props;
            const entityManager = this.readManager.fork();
            const builder = entityManager.createQueryBuilder(Organization, "o");

            builder
                .select(["o.id", "o.title"])
                .limit(pagination.elementsPerPage)
                .offset((pagination.currentPage - 1) * pagination.elementsPerPage);

            if (term) {
                builder
                    .where("o.title % ?", [term])
                    .orderBy([
                        { [raw("similarity(o.title, ?)", [term])]: "DESC" },
                        { "o.title": "ASC" },
                        { "o.id": "ASC" },
                    ]);
            } else {
                builder.orderBy({ "o.title": "ASC", "o.id": "ASC" });
            }

            return await builder.getResultAndCount();
        } catch (error) {
            throw ExceptionMapper.fromORM(error, this.resource);
        }
    }
}
