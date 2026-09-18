import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Patch } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { INVITE_COMMANDS } from "~context/application/commands";
import { INVITE_QUERIES } from "~context/application/queries";
import { SuccessMessageDTO } from "~common/dto";
import { PermissionCode } from "~context/enums";

import {
    GetByIdQueryDTO,
    GetListQueryDTO,
    GetListBodyDTO,
    CreateQueryDTO,
    DeclineBodyDTO,
    CancelQueryDTO,
    CancelBodyDTO,
    CreateBodyDTO,
    AcceptBodyDTO,
    InviteDTO,
    ListDTO,
} from "../dto/invite";

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

@ApiTags("Invite")
@Controller("/invite")
export class InviteController {
    public constructor(
        @Inject(INVITE_COMMANDS)
        private readonly commands: Commands.Invite.ControllerContract,
        @Inject(INVITE_QUERIES)
        private readonly queries: Queries.Invite.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(InviteDTO)
    @RequirePermission(
        PermissionCode.INVITE_READ_PERSONAL,
        PermissionCode.INVITE_READ_ABSOLUTE,
        PermissionCode.INVITE_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: InviteDTO })
    @ApiOperation({
        summary: "Returns a scoped invite record by identifier",
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
        @Query() { realm, invite, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Invite.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, invite, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.INVITE_READ_PERSONAL,
        PermissionCode.INVITE_READ_ABSOLUTE,
        PermissionCode.INVITE_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of invite records",
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
        @Body() { pagination, filters, sort, scope }: GetListBodyDTO,
        @Query() { realm, view, mode }: GetListQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Invite.FindMany.Result {
        return this.queries.findMany({
            permissions,
            pagination,
            filters,
            realm,
            actor,
            scope,
            mode,
            view,
            sort,
        });
    }

    @Post("create")
    @HttpCode(CREATED)
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.INVITE_CREATE)
    @ApiResponse({ status: CREATED, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Creates invite",
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
    @Patch("accept")
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.INVITE_ACCEPT)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Accepts invite",
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
    public accept(
        @Body() { realm, ...input }: AcceptBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.accept({ context, actor, input, realm });
    }

    @HttpCode(OK)
    @Patch("decline")
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.INVITE_DECLINE)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Declines invite",
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
    public decline(
        @Body() { realm, ...input }: DeclineBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.decline({ context, actor, input, realm });
    }

    @HttpCode(OK)
    @Patch("cancel")
    @FormatResponse(SuccessMessageDTO)
    @RequirePermission(PermissionCode.INVITE_CANCEL)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Cancels invite",
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
    public cancel(
        @Query() { realm }: CancelQueryDTO,
        @Body() input: CancelBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.cancel({ context, actor, input, realm });
    }
}
