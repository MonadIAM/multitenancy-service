import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Patch, Delete } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Reauthentication, Swagger } from "~common/decorators";
import { ORGANIZATION_COMMANDS } from "~context/application/commands";
import { SuccessMessageDTO } from "~common/dto";
import { ORGANIZATION_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    CreateBodyDTO,
    UpdateQueryDTO,
    UpdateBodyDTO,
    TransferOwnershipQueryDTO,
    TransferOwnershipBodyDTO,
    RevokeQueryDTO,
    RevokeBodyDTO,
    RestoreQueryDTO,
    RestoreBodyDTO,
    PurgeQueryDTO,
    PurgeBodyDTO,
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
    BAD_REQUEST,
    CONFLICT,
    CREATED,
    FORBIDDEN,
    NOT_FOUND,
    OK,
} = HttpStatus;

@ApiTags("Organization")
@Controller("/organization")
export class OrganizationController {
    public constructor(
        @Inject(ORGANIZATION_COMMANDS)
        private readonly commands: Commands.Organization.ControllerContract,
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

    @Post("create")
    @HttpCode(CREATED)
    @RequirePermission(PermissionCode.ORGANIZATION_CREATE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: CREATED, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Creates organization",
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
        @Body() input: CreateBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.create({ context, actor, input });
    }

    @Patch("update")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.ORGANIZATION_UPDATE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Updates organization",
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
    public updateMetadata(
        @Query() { id, realm }: UpdateQueryDTO,
        @Body() input: UpdateBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.update({ context, actor, input, realm, id });
    }

    @Patch("transfer-ownership")
    @HttpCode(OK)
    @Reauthentication()
    @RequirePermission(PermissionCode.ORGANIZATION_TRANSFER_OWNERSHIP)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Transfers ownership of organization",
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
    public transferOwnership(
        @Query() { id, realm }: TransferOwnershipQueryDTO,
        @Body() input: TransferOwnershipBodyDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Meta() context: Extract.Meta,
    ): Promise<MessageResult> {
        return this.commands.transferOwnership({ context, actor, input, realm, id });
    }

    @Patch("revoke")
    @HttpCode(OK)
    @RequirePermission(PermissionCode.ORGANIZATION_REVOKE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Revokes organization records",
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
    @RequirePermission(PermissionCode.ORGANIZATION_RESTORE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Restores organization records",
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
    @RequirePermission(PermissionCode.ORGANIZATION_PURGE)
    @FormatResponse(SuccessMessageDTO)
    @ApiResponse({ status: OK, type: SuccessMessageDTO })
    @ApiOperation({
        summary: "Permanently deletes organization records",
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
