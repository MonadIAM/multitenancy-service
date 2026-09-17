import { Inject, Injectable, Scope } from "@nestjs/common";

import { AUDIT_LOG_REPOSITORY } from "~context/infrastructure/repositories";
import { QueryMode } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class AuditLogQueries implements Queries.AuditLog.Contract {
    public constructor(
        @Inject(AUDIT_LOG_REPOSITORY)
        private readonly auditLogRepository: Repositories.AuditLog.QueryContract,
    ) {}

    public findUnique(props: Queries.AuditLog.FindUnique.Props): Queries.AuditLog.FindUnique.Result {
        const where: ORM.Prefilter<SystemEntities.AuditLog> = {
            id: props.log,
        };

        if (props.mode === QueryMode.DEFAULT) {
            where.realm = props.realm;
        }

        return this.auditLogRepository.findUniqueOrThrow({ where });
    }

    public findMany(props: Queries.AuditLog.FindMany.Props): Queries.AuditLog.FindMany.Result {
        const prefilter: ORM.Prefilter<SystemEntities.AuditLog> = {};

        if (props.mode === QueryMode.DEFAULT) {
            prefilter.realm = props.realm;
        }

        return this.auditLogRepository.findMany({
            pagination: props.pagination,
            filters: props.filters,
            sort: props.sort,
            prefilter,
        });
    }
}
