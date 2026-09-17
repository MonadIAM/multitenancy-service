import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { ORG_MEMBERSHIP_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    OrgMembershipDTO,
    GetListBodyDTO,
    ListDTO,
} from "../dto/org-membership";

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

@ApiTags("OrgMembership")
@Controller("/org-membership/manage")
export class OrgMembershipManageController {
    public constructor(
        @Inject(ORG_MEMBERSHIP_QUERIES)
        private readonly queries: Queries.OrgMembership.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(OrgMembershipDTO)
    @RequireGlobalPermission(PermissionCode.MEMBERSHIP_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: OrgMembershipDTO })
    @ApiOperation({
        summary: "Returns any org-membership record by identifier",
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
    public findUnique(@Query() { membership, view, mode }: ManageGetByIdQueryDTO): Queries.OrgMembership.FindUnique.Result {
        return this.queries.findUnique({ mode, membership, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.MEMBERSHIP_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all org-membership records",
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
    ): Queries.OrgMembership.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
