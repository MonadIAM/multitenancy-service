import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { INVITE_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import { ManageGetByIdQueryDTO, ManageGetListQueryDTO, ManageGetListBodyDTO, InviteDTO, ListDTO } from "../dto/invite";

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

@ApiTags("Invite")
@Controller("/invite/manage")
export class InviteManageController {
    public constructor(
        @Inject(INVITE_QUERIES)
        private readonly queries: Queries.Invite.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(InviteDTO)
    @RequireGlobalPermission(PermissionCode.INVITE_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: InviteDTO })
    @ApiOperation({
        summary: "Returns any invite record by identifier",
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
    public findUnique(@Query() { invite, view, mode }: ManageGetByIdQueryDTO): Queries.Invite.FindUnique.Result {
        return this.queries.findUnique({ mode, invite, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.INVITE_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all invite records",
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
        @Body() { pagination, filters, sort }: ManageGetListBodyDTO,
        @Query() { view, mode }: ManageGetListQueryDTO,
    ): Queries.Invite.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
