import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { TEAM_ACCOUNT_ASSIGNMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    TeamAccountAssignmentDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
    GetListBodyDTO,
    ListDTO,
} from "../dto/team-account-assignment";

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

@ApiTags("TeamAccountAssignment")
@Controller("/team-account-assignment")
export class TeamAccountAssignmentController {
    public constructor(
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_QUERIES)
        private readonly queries: Queries.TeamAccountAssignment.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(TeamAccountAssignmentDTO)
    @RequirePermission(
        PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_PERSONAL,
        PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE,
        PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: TeamAccountAssignmentDTO })
    @ApiOperation({
        summary: "Returns a scoped team-account-assignment record by identifier",
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
        @Query() { realm, assignment, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.TeamAccountAssignment.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, assignment, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_PERSONAL,
        PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE,
        PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of team-account-assignment records",
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
    ): Queries.TeamAccountAssignment.FindMany.Result {
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
}
