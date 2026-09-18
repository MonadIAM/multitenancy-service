import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Patch } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Reauthentication, Swagger } from "~common/decorators";
import { ORG_MEMBERSHIP_COMMANDS } from "~context/application/commands";
import { SuccessMessageDTO } from "~common/dto";
import { ORG_MEMBERSHIP_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    SuspendQueryDTO,
    SuspendBodyDTO,
    ResumeQueryDTO,
    ResumeBodyDTO,
    LeaveQueryDTO,
    LeaveBodyDTO,
    BlockQueryDTO,
    BlockBodyDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
    GetListBodyDTO,
    OrgMembershipDTO,
    ListDTO,
} from "../dto/org-membership";

const {
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
    SERVICE_UNAVAILABLE,
    REQUEST_TIMEOUT,
    UNAUTHORIZED,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    OK,
} = HttpStatus;

@ApiTags("OrgMembership")
@Controller("/org-membership")
export class OrgMembershipController {
    public constructor(
        @Inject(ORG_MEMBERSHIP_COMMANDS)
        private readonly commands: Commands.OrgMembership.ControllerContract,
        @Inject(ORG_MEMBERSHIP_QUERIES)
        private readonly queries: Queries.OrgMembership.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(OrgMembershipDTO)
    @RequirePermission(
        PermissionCode.MEMBERSHIP_READ_PERSONAL,
        PermissionCode.MEMBERSHIP_READ_COMMON,
        PermissionCode.MEMBERSHIP_READ_ABSOLUTE,
    )
    @ApiResponse({ status: OK, type: OrgMembershipDTO })
    @ApiOperation({
        summary: "Returns a scoped org-membership record by identifier",
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
        @Query() { realm, membership, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.OrgMembership.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, membership, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.MEMBERSHIP_READ_PERSONAL,
        PermissionCode.MEMBERSHIP_READ_COMMON,
        PermissionCode.MEMBERSHIP_READ_ABSOLUTE,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of org-membership records",
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
    ): Queries.OrgMembership.FindMany.Result {
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

    @Patch("suspend")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.MEMBERSHIP_SUSPEND)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Suspends org membership records",
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
    public suspend(
        @Query() { realm }: SuspendQueryDTO,
        @Body() input: SuspendBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.suspend({ context, actor, input, realm });
    }

    @Patch("resume")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.MEMBERSHIP_RESUME)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Resumes org membership records",
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
    public resume(
        @Query() { realm }: ResumeQueryDTO,
        @Body() input: ResumeBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.resume({ context, actor, input, realm });
    }

    @Patch("leave")
    @HttpCode(OK)
    @Reauthentication()
    @RequirePermission(PermissionCode.MEMBERSHIP_LEAVE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Leaves org membership records",
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
    public leave(
        @Query() { realm }: LeaveQueryDTO,
        @Body() input: LeaveBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.leave({ context, actor, input, realm });
    }

    @Patch("block")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.MEMBERSHIP_BLOCK)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Blocks org membership records",
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
    public block(
        @Query() { realm }: BlockQueryDTO,
        @Body() input: BlockBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.block({ context, actor, input, realm });
    }
}
