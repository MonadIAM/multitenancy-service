import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { AUDIT_LOG_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import { AuditLogDTO, GetListBodyDTO, ListDTO, ManageGetByIdQueryDTO, ManageGetListQueryDTO } from "../dto/audit-log";

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
const { AUDIT_LOG_READ_ABSOLUTE } = PermissionCode;

@ApiTags("AuditLog")
@Controller("/audit-log/manage")
export class AuditLogManageController {
    public constructor(
        @Inject(AUDIT_LOG_QUERIES)
        private readonly queries: Queries.AuditLog.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(AuditLogDTO)
    @RequireGlobalPermission(AUDIT_LOG_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: AuditLogDTO })
    @ApiOperation({
        summary: "Returns any audit log by identifier",
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
    public findUnique(@Query() { log, mode }: ManageGetByIdQueryDTO): Queries.AuditLog.FindUnique.Result {
        return this.queries.findUnique({ mode, log });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(AUDIT_LOG_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all audit logs",
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
        @Query() { mode }: ManageGetListQueryDTO,
    ): Queries.AuditLog.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort });
    }
}
