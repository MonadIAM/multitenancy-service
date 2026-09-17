import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { ORGANIZATION_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    ManageGetLookupListQueryDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    GetLookupListBodyDTO,
    OrganizationDTO,
    GetListBodyDTO,
    LookupListDTO,
    ListDTO,
} from "../dto/organization";

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

@ApiTags("Organization")
@Controller("/organization/manage")
export class OrganizationManageController {
    public constructor(
        @Inject(ORGANIZATION_QUERIES)
        private readonly queries: Queries.Organization.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(OrganizationDTO)
    @RequireGlobalPermission(PermissionCode.ORGANIZATION_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: OrganizationDTO })
    @ApiOperation({
        summary: "Returns any organization record by identifier",
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
    public findUnique(
        @Query() { organization, view, mode }: ManageGetByIdQueryDTO,
    ): Queries.Organization.FindUnique.Result {
        return this.queries.findUnique({ mode, organization, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.ORGANIZATION_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all organization records",
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
    ): Queries.Organization.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }

    @Post("list/lookup")
    @HttpCode(OK)
    @FormatResponse(LookupListDTO)
    @RequireGlobalPermission(PermissionCode.ORGANIZATION_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a global lookup list of organization records",
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
    public getLookupList(
        @Body() { pagination }: GetLookupListBodyDTO,
        @Query() { term, mode }: ManageGetLookupListQueryDTO,
    ): Queries.Organization.GetLookupList.Result {
        return this.queries.getLookupList({ mode, pagination, term });
    }
}
