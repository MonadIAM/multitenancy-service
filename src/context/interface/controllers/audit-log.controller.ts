import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { AUDIT_LOG_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import { AuditLogDTO, GetByIdQueryDTO, GetListBodyDTO, GetListQueryDTO, ListDTO } from "../dto/audit-log";

const { AUDIT_LOG_READ_ABSOLUTE } = PermissionCode;
const {
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
    SERVICE_UNAVAILABLE,
    REQUEST_TIMEOUT,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    OK,
} = HttpStatus;

@ApiTags("AuditLog")
@Controller("/audit-log")
export class AuditLogController {
    public constructor(
        @Inject(AUDIT_LOG_QUERIES)
        private readonly queries: Queries.AuditLog.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(AuditLogDTO)
    @RequirePermission(AUDIT_LOG_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: AuditLogDTO })
    @ApiOperation({
        summary: "Returns an audit log by identifier",
        security: [{ identity: [] }],
    })
    @Swagger.Exceptions(
        INTERNAL_SERVER_ERROR,
        UNPROCESSABLE_ENTITY,
        SERVICE_UNAVAILABLE,
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        FORBIDDEN,
        NOT_FOUND,
    )
    public findUnique(@Query() { log, realm, mode }: GetByIdQueryDTO): Queries.AuditLog.FindUnique.Result {
        return this.queries.findUnique({ mode, log, realm });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(AUDIT_LOG_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of audit logs",
        security: [{ identity: [] }],
    })
    @Swagger.Exceptions(
        INTERNAL_SERVER_ERROR,
        UNPROCESSABLE_ENTITY,
        SERVICE_UNAVAILABLE,
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        FORBIDDEN,
    )
    public findMany(
        @Body() { pagination, filters, sort }: GetListBodyDTO,
        @Query() { realm, mode }: GetListQueryDTO,
    ): Queries.AuditLog.FindMany.Result {
        return this.queries.findMany({
            pagination,
            filters,
            realm,
            sort,
            mode,
        });
    }
}
