import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { ORGANIZATION_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    GetLookupListQueryDTO,
    GetLookupListBodyDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
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
@Controller("/organization")
export class OrganizationController {
    public constructor(
        @Inject(ORGANIZATION_QUERIES)
        private readonly queries: Queries.Organization.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(OrganizationDTO)
    @RequirePermission(PermissionCode.ORGANIZATION_READ_PERSONAL, PermissionCode.ORGANIZATION_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: OrganizationDTO })
    @ApiOperation({
        summary: "Returns a scoped organization record by identifier",
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
        @Query() { organization, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Organization.FindUnique.Result {
        return this.queries.findUnique({ mode, organization, permissions, actor, view });
    }

    @Post("my/list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(PermissionCode.ORGANIZATION_READ_PERSONAL)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of organization records",
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
        @Query() { view, mode }: GetListQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
    ): Queries.Organization.FindMany.Result {
        return this.queries.findMany({
            pagination,
            filters,
            actor,
            view,
            sort,
            mode,
        });
    }

    @HttpCode(OK)
    @Post("my/list/lookup")
    @FormatResponse(LookupListDTO)
    @RequirePermission(PermissionCode.ORGANIZATION_READ_PERSONAL)
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a scoped lookup list of organization records",
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
        @Query() { term, mode }: GetLookupListQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
    ): Queries.Organization.GetLookupList.Result {
        return this.queries.getLookupList({ mode, pagination, actor, term });
    }
}
