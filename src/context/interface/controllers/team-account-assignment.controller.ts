import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Patch, Delete } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Reauthentication, Swagger } from "~common/decorators";
import { TEAM_ACCOUNT_ASSIGNMENT_COMMANDS } from "~context/application/commands";
import { SuccessMessageDTO } from "~common/dto";
import { TEAM_ACCOUNT_ASSIGNMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    CreateQueryDTO,
    CreateBodyDTO,
    RevokeQueryDTO,
    RevokeBodyDTO,
    RestoreQueryDTO,
    RestoreBodyDTO,
    PurgeQueryDTO,
    PurgeBodyDTO,
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
    BAD_REQUEST,
    CONFLICT,
    CREATED,
    FORBIDDEN,
    NOT_FOUND,
    OK,
} = HttpStatus;

@ApiTags("TeamAccountAssignment")
@Controller("/team-account-assignment")
export class TeamAccountAssignmentController {
    public constructor(
        @Inject(TEAM_ACCOUNT_ASSIGNMENT_COMMANDS)
        private readonly commands: Commands.TeamAccountAssignment.ControllerContract,
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

    @Post("create")
    @HttpCode(CREATED)
    @RequirePermission(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_CREATE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: CREATED, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Creates team account assignment",
        security: [{ identity: [] }],
    })
    @Swagger.Exceptions(
        INTERNAL_SERVER_ERROR,
        UNPROCESSABLE_ENTITY,
        SERVICE_UNAVAILABLE,
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        BAD_REQUEST,
        NOT_FOUND,
        FORBIDDEN,
        CONFLICT,
    )
    public create(
        @Query() { realm }: CreateQueryDTO,
        @Body() input: CreateBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.create({ context, actor, input, realm });
    }

    @Patch("revoke")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_REVOKE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Revokes team account assignment records",
        security: [{ identity: [] }],
    })
    @Swagger.Exceptions(
        INTERNAL_SERVER_ERROR,
        UNPROCESSABLE_ENTITY,
        SERVICE_UNAVAILABLE,
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        BAD_REQUEST,
        NOT_FOUND,
        FORBIDDEN,
    )
    public revoke(
        @Query() { realm }: RevokeQueryDTO,
        @Body() input: RevokeBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.revoke({ context, actor, input, realm });
    }

    @Patch("restore")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_RESTORE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Restores team account assignment records",
        security: [{ identity: [] }],
    })
    @Swagger.Exceptions(
        INTERNAL_SERVER_ERROR,
        UNPROCESSABLE_ENTITY,
        SERVICE_UNAVAILABLE,
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        BAD_REQUEST,
        NOT_FOUND,
        FORBIDDEN,
    )
    public restore(
        @Query() { realm }: RestoreQueryDTO,
        @Body() input: RestoreBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.restore({ context, actor, input, realm });
    }

    @Delete("purge")
    @HttpCode(OK)
    @Reauthentication()
    @RequirePermission(PermissionCode.TEAM_ACCOUNT_ASSIGNMENT_PURGE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Permanently deletes team account assignment records",
        security: [{ identity: [] }],
    })
    @Swagger.Exceptions(
        INTERNAL_SERVER_ERROR,
        UNPROCESSABLE_ENTITY,
        SERVICE_UNAVAILABLE,
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        BAD_REQUEST,
        NOT_FOUND,
        FORBIDDEN,
    )
    public purge(
        @Query() { realm }: PurgeQueryDTO,
        @Body() input: PurgeBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.purge({ context, actor, input, realm });
    }
}
