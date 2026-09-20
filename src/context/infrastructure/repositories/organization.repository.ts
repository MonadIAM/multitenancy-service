import { InjectEntityManager } from "@mikro-orm/nestjs";
import { Injectable, Scope } from "@nestjs/common";
import { raw } from "@mikro-orm/postgresql";

import { ExceptionMapper } from "~common/exceptions";
import { BaseRepository } from "~common/mixins";
import {
    ProjectAccountAssignment,
    DeptAccountAssignment,
    TeamAccountAssignment,
    OrgMembership,
    Organization,
    Department,
    Project,
    Invite,
    Team,
} from "~context/domain/entities";

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

    public async findDependents(
        props: Repositories.Organization.FindDependents.Props,
    ): Repositories.Organization.FindDependents.Result {
        const { identifiers, transaction } = props;
        const where = { organization: { $in: identifiers } };
        const groups = await Promise.all([
            transaction.find(ProjectAccountAssignment, where),
            transaction.find(DeptAccountAssignment, where),
            transaction.find(TeamAccountAssignment, where),
            transaction.find(Invite, where),
            transaction.find(Team, where),
            transaction.find(Department, where),
            transaction.find(Project, where),
            transaction.find(OrgMembership, where),
        ]);

        return groups.flat();
    }

    public async getLookupList(
        props: Repositories.Organization.GetLookupList.Props,
    ): Repositories.Organization.GetLookupList.Result {
        try {
            const { pagination, prefilter, term } = props;
            const entityManager = this.readManager.fork();
            const builder = entityManager.createQueryBuilder(Organization, "o");

            builder
                .select(["o.id", "o.title"])
                .limit(pagination.elementsPerPage)
                .offset((pagination.currentPage - 1) * pagination.elementsPerPage);

            if (prefilter) {
                builder.where(prefilter);
            }

            if (term) {
                builder
                    .andWhere("o.title % ?", [term])
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
