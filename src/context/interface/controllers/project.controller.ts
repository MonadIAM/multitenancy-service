import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { PROJECT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    GetLookupListQueryDTO,
    GetLookupListBodyDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
    GetListBodyDTO,
    LookupListDTO,
    ProjectDTO,
    ListDTO,
} from "../dto/project";

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

@ApiTags("Project")
@Controller("/project")
export class ProjectController {
    public constructor(
        @Inject(PROJECT_QUERIES)
        private readonly queries: Queries.Project.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(ProjectDTO)
    @RequirePermission(
        PermissionCode.PROJECT_READ_PERSONAL,
        PermissionCode.PROJECT_READ_ABSOLUTE,
        PermissionCode.PROJECT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ProjectDTO })
    @ApiOperation({
        summary: "Returns a scoped project record by identifier",
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
        @Query() { realm, project, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Project.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, project, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.PROJECT_READ_PERSONAL,
        PermissionCode.PROJECT_READ_ABSOLUTE,
        PermissionCode.PROJECT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of project records",
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
    ): Queries.Project.FindMany.Result {
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
        PermissionCode.PROJECT_READ_PERSONAL,
        PermissionCode.PROJECT_READ_ABSOLUTE,
        PermissionCode.PROJECT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a scoped lookup list of project records",
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
        @Query() { realm, term, mode, organization }: GetLookupListQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Project.GetLookupList.Result {
        return this.queries.getLookupList({
            organization,
            permissions,
            pagination,
            actor,
            realm,
            term,
            mode,
        });
    }
}
