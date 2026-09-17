import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { PROJECT_ACCOUNT_ASSIGNMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    ProjectAccountAssignmentDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    GetListBodyDTO,
    ListDTO,
} from "../dto/project-account-assignment";

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

@ApiTags("ProjectAccountAssignment")
@Controller("/project-account-assignment/manage")
export class ProjectAccountAssignmentManageController {
    public constructor(
        @Inject(PROJECT_ACCOUNT_ASSIGNMENT_QUERIES)
        private readonly queries: Queries.ProjectAccountAssignment.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(ProjectAccountAssignmentDTO)
    @RequireGlobalPermission(PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ProjectAccountAssignmentDTO })
    @ApiOperation({
        summary: "Returns any project-account-assignment record by identifier",
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
    ): Queries.ProjectAccountAssignment.FindUnique.Result {
        return this.queries.findUnique({ mode, assignment, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.PROJECT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all project-account-assignment records",
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
    ): Queries.ProjectAccountAssignment.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
