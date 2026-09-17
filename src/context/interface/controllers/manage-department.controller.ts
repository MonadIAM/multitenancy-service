import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { DEPARTMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    ManageGetLookupListQueryDTO,
    ManageGetByIdQueryDTO,
    ManageGetListQueryDTO,
    GetLookupListBodyDTO,
    GetListBodyDTO,
    DepartmentDTO,
    LookupListDTO,
    ListDTO,
} from "../dto/department";

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

@ApiTags("Department")
@Controller("/department/manage")
export class DepartmentManageController {
    public constructor(
        @Inject(DEPARTMENT_QUERIES)
        private readonly queries: Queries.Department.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(DepartmentDTO)
    @RequireGlobalPermission(PermissionCode.DEPARTMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: DepartmentDTO })
    @ApiOperation({
        summary: "Returns any department record by identifier",
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
    public findUnique(@Query() { department, view, mode }: ManageGetByIdQueryDTO): Queries.Department.FindUnique.Result {
        return this.queries.findUnique({ mode, department, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequireGlobalPermission(PermissionCode.DEPARTMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a paginated list of all department records",
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
    ): Queries.Department.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }

    @HttpCode(OK)
    @Post("list/lookup")
    @FormatResponse(LookupListDTO)
    @RequireGlobalPermission(PermissionCode.DEPARTMENT_READ_ABSOLUTE)
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a global lookup list of department records",
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
    ): Queries.Department.GetLookupList.Result {
        return this.queries.getLookupList({
            organization,
            pagination,
            mode,
            term,
        });
    }
}
