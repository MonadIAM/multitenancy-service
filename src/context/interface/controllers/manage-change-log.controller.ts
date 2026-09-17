import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { CHANGE_LOG_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import { ChangeLogDTO, GetByIdQueryDTO, GetListBodyDTO, ListDTO } from "../dto/change-log";

const { CHANGE_LOG_READ_ABSOLUTE } = PermissionCode;
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

@ApiTags("ChangeLog")
@Controller("/change-log/manage")
export class ChangeLogManageController {
    public constructor(
        @Inject(CHANGE_LOG_QUERIES)
        private readonly queries: Queries.ChangeLog.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(ChangeLogDTO)
    @RequireGlobalPermission(CHANGE_LOG_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ChangeLogDTO })
    @ApiOperation({
        summary: "Returns a change log by identifier",
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
    public findUnique(@Query() { log }: GetByIdQueryDTO): Queries.ChangeLog.FindUnique.Result {
        return this.queries.findUnique({ log });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(CHANGE_LOG_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of change logs",
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
    public findMany(@Body() { pagination, filters, sort }: GetListBodyDTO): Queries.ChangeLog.FindMany.Result {
        return this.queries.findMany({ pagination, filters, sort });
    }
}
