import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { MEMBERSHIP_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import { ManageGetByIdQueryDTO, ManageGetListQueryDTO, MembershipDTO, GetListBodyDTO, ListDTO } from "../dto/membership";

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

@ApiTags("Membership")
@Controller("/membership/manage")
export class MembershipManageController {
    public constructor(
        @Inject(MEMBERSHIP_QUERIES)
        private readonly queries: Queries.Membership.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(MembershipDTO)
    @RequireGlobalPermission(PermissionCode.MEMBERSHIP_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: MembershipDTO })
    @ApiOperation({
        summary: "Returns any membership record by identifier",
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
    public findUnique(@Query() { membership, view, mode }: ManageGetByIdQueryDTO): Queries.Membership.FindUnique.Result {
        return this.queries.findUnique({ mode, membership, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.MEMBERSHIP_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all membership records",
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
        @Query() { view, mode }: ManageGetListQueryDTO,
    ): Queries.Membership.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
