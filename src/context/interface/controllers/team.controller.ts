import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { TEAM_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    GetLookupListQueryDTO,
    GetLookupListBodyDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
    GetListBodyDTO,
    LookupListDTO,
    TeamDTO,
    ListDTO,
} from "../dto/team";

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

@ApiTags("Team")
@Controller("/team")
export class TeamController {
    public constructor(
        @Inject(TEAM_QUERIES)
        private readonly queries: Queries.Team.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(TeamDTO)
    @RequirePermission(
        PermissionCode.TEAM_READ_PERSONAL,
        PermissionCode.TEAM_READ_ABSOLUTE,
        PermissionCode.TEAM_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: TeamDTO })
    @ApiOperation({
        summary: "Returns a scoped team record by identifier",
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
        @Query() { realm, team, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Team.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, team, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.TEAM_READ_PERSONAL,
        PermissionCode.TEAM_READ_ABSOLUTE,
        PermissionCode.TEAM_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of team records",
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
        @Query() { realm, view, mode }: GetListQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Team.FindMany.Result {
        return this.queries.findMany({
            permissions,
            pagination,
            filters,
            realm,
            actor,
            view,
            sort,
            mode,
        });
    }

    @HttpCode(OK)
    @Post("list/lookup")
    @FormatResponse(LookupListDTO)
    @RequirePermission(
        PermissionCode.TEAM_READ_PERSONAL,
        PermissionCode.TEAM_READ_COMMON,
        PermissionCode.TEAM_READ_ABSOLUTE,
    )
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a scoped lookup list of team records",
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
        @Query() { realm, term, mode, organization, department }: GetLookupListQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Team.GetLookupList.Result {
        return this.queries.getLookupList({
            organization,
            permissions,
            department,
            pagination,
            actor,
            realm,
            mode,
            term,
        });
    }
}
