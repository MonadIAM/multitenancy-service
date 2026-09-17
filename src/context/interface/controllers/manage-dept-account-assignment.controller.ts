import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { DEPT_ACCOUNT_ASSIGNMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    DeptAccountAssignmentDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    GetListBodyDTO,
    ListDTO,
} from "../dto/dept-account-assignment";

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

@ApiTags("DeptAccountAssignment")
@Controller("/dept-account-assignment/manage")
export class DeptAccountAssignmentManageController {
    public constructor(
        @Inject(DEPT_ACCOUNT_ASSIGNMENT_QUERIES)
        private readonly queries: Queries.DeptAccountAssignment.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(DeptAccountAssignmentDTO)
    @RequireGlobalPermission(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: DeptAccountAssignmentDTO })
    @ApiOperation({
        summary: "Returns any dept-account-assignment record by identifier",
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
    ): Queries.DeptAccountAssignment.FindUnique.Result {
        return this.queries.findUnique({ mode, assignment, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.DEPT_ACCOUNT_ASSIGNMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all dept-account-assignment records",
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
    ): Queries.DeptAccountAssignment.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
