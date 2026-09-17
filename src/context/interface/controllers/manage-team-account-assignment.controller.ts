import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { TEAM_ACCOUNT_ASSIGNMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    TeamAccountAssignmentDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
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
@Controller("/team-account-assignment/manage")
export class TeamAccountAssignmentManageController {
    public constructor(
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_QUERIES)
        private readonly queries: Queries.TeamAccountAssignment.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(TeamAccountAssignmentDTO)
    @RequireGlobalPermission(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: TeamAccountAssignmentDTO })
    @ApiOperation({
        summary: "Returns any team-account-assignment record by identifier",
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
        @Query() { assignment, view, mode }: ManageGetByIdQueryDTO,
    ): Queries.TeamAccountAssignment.FindUnique.Result {
        return this.queries.findUnique({ mode, assignment, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all team-account-assignment records",
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
    ): Queries.TeamAccountAssignment.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
