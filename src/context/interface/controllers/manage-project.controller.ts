import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { PROJECT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    ManageGetLookupListQueryDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    GetLookupListBodyDTO,
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
@Controller("/project/manage")
export class ProjectManageController {
    public constructor(
        @Inject(PROJECT_QUERIES)
        private readonly queries: Queries.Project.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(ProjectDTO)
    @RequireGlobalPermission(PermissionCode.PROJECT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ProjectDTO })
    @ApiOperation({
        summary: "Returns any project record by identifier",
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
    public findUnique(@Query() { project, view, mode }: ManageGetByIdQueryDTO): Queries.Project.FindUnique.Result {
        return this.queries.findUnique({ mode, project, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.PROJECT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all project records",
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
    ): Queries.Project.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }

    @HttpCode(OK)
    @Post("list/lookup")
    @FormatResponse(LookupListDTO)
    @RequireGlobalPermission(PermissionCode.PROJECT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a global lookup list of project records",
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
        @Query() { term, mode, organization }: ManageGetLookupListQueryDTO,
    ): Queries.Project.GetLookupList.Result {
        return this.queries.getLookupList({
            organization,
            pagination,
            mode,
            term,
        });
    }
}
