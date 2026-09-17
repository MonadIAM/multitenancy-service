import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { TEAM_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    ManageGetLookupListQueryDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    GetLookupListBodyDTO,
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
@Controller("/team/manage")
export class TeamManageController {
    public constructor(
        @Inject(TEAM_QUERIES)
        private readonly queries: Queries.Team.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(TeamDTO)
    @RequireGlobalPermission(PermissionCode.TEAM_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: TeamDTO })
    @ApiOperation({
        summary: "Returns any team record by identifier",
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
    public findUnique(@Query() { team, view, mode }: ManageGetByIdQueryDTO): Queries.Team.FindUnique.Result {
        return this.queries.findUnique({ mode, team, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.TEAM_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all team records",
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
    ): Queries.Team.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }

    @Post("list/lookup")
    @HttpCode(OK)
    @FormatResponse(LookupListDTO)
    @RequireGlobalPermission(PermissionCode.TEAM_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a global lookup list of team records",
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
        @Query() { term, mode, organization, department }: ManageGetLookupListQueryDTO,
    ): Queries.Team.GetLookupList.Result {
        return this.queries.getLookupList({
            organization,
            pagination,
            department,
            mode,
            term,
        });
    }
}
