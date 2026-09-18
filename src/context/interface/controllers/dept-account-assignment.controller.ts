import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Patch, Delete } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Reauthentication, Swagger } from "~common/decorators";
import { DEPT_ACCOUNT_ASSIGNMENT_COMMANDS } from "~context/application/commands";
import { DEPT_ACCOUNT_ASSIGNMENT_QUERIES } from "~context/application/queries";
import { SuccessMessageDTO } from "~common/dto";
import { PermissionCode } from "~context/enums";

import {
    DeptAccountAssignmentDTO,
    RestoreQueryDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
    GetListBodyDTO,
    RestoreBodyDTO,
    CreateQueryDTO,
    RevokeQueryDTO,
    PurgeQueryDTO,
    CreateBodyDTO,
    RevokeBodyDTO,
    PurgeBodyDTO,
    ListDTO,
} from "../dto/dept-account-assignment";

const {
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
    SERVICE_UNAVAILABLE,
    REQUEST_TIMEOUT,
    UNAUTHORIZED,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    CONFLICT,
    CREATED,
    OK,
} = HttpStatus;

@ApiTags("DeptAccountAssignment")
@Controller("/dept-account-assignment")
export class DeptAccountAssignmentController {
    public constructor(
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_COMMANDS)
        private readonly commands: Commands.DeptAccountAssignment.ControllerContract,
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_QUERIES)
        private readonly queries: Queries.DeptAccountAssignment.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(DeptAccountAssignmentDTO)
    @RequirePermission(
        PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_PERSONAL,
        PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE,
        PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: DeptAccountAssignmentDTO })
    @ApiOperation({
        summary: "Returns a scoped dept-account-assignment record by identifier",
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
    ): Queries.DeptAccountAssignment.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, assignment, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_PERSONAL,
        PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE,
        PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of dept-account-assignment records",
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
    ): Queries.DeptAccountAssignment.FindMany.Result {
        return this.queries.findMany({
            permissions,
            pagination,
            filters,
            realm,
            actor,
            mode,
            view,
            sort,
        });
    }

    @Post("create")
    @HttpCode(CREATED)
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_CREATE)
    @ApiResponse({ status: CREATED, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Creates dept account assignment",
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

    @HttpCode(OK)
    @Patch("revoke")
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_REVOKE)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Revokes dept account assignment records",
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

    @HttpCode(OK)
    @Patch("restore")
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_RESTORE)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Restores dept account assignment records",
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

    @HttpCode(OK)
    @Delete("purge")
    @Reauthentication()
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_PURGE)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Permanently deletes dept account assignment records",
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
