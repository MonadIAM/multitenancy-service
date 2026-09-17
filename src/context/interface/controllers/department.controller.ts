import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Extract, FormatResponse, RequirePermission, Swagger } from "~common/decorators";
import { DEPARTMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import {
    GetLookupListQueryDTO,
    GetLookupListBodyDTO,
    GetByIdQueryDTO,
    GetListQueryDTO,
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
@Controller("/department")
export class DepartmentController {
    public constructor(
        @Inject(DEPARTMENT_QUERIES)
        private readonly queries: Queries.Department.PublicContract,
    ) {}

    @Get()
    @HttpCode(OK)
    @FormatResponse(DepartmentDTO)
    @RequirePermission(
        PermissionCode.DEPARTMENT_READ_PERSONAL,
        PermissionCode.DEPARTMENT_READ_ABSOLUTE,
        PermissionCode.DEPARTMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: DepartmentDTO })
    @ApiOperation({
        summary: "Returns a scoped department record by identifier",
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
        @Query() { realm, department, view, mode }: GetByIdQueryDTO,
        @Extract.Session() { account: actor }: Extract.Session.Auth,
        @Extract.Permissions() permissions: string[],
    ): Queries.Department.FindUnique.Result {
        return this.queries.findUnique({ mode, realm, department, permissions, actor, view });
    }

    @Post("list")
    @HttpCode(OK)
    @FormatResponse(ListDTO)
    @RequirePermission(
        PermissionCode.DEPARTMENT_READ_PERSONAL,
        PermissionCode.DEPARTMENT_READ_ABSOLUTE,
        PermissionCode.DEPARTMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: ListDTO })
    @ApiOperation({
        summary: "Returns a scoped paginated list of department records",
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
    ): Queries.Department.FindMany.Result {
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

    @HttpCode(OK)
    @Post("list/lookup")
    @FormatResponse(LookupListDTO)
    @RequirePermission(
        PermissionCode.DEPARTMENT_READ_PERSONAL,
        PermissionCode.DEPARTMENT_READ_ABSOLUTE,
        PermissionCode.DEPARTMENT_READ_COMMON,
    )
    @ApiResponse({ status: OK, type: LookupListDTO })
    @ApiOperation({
        summary: "Returns a scoped lookup list of department records",
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
    ): Queries.Department.GetLookupList.Result {
        return this.queries.getLookupList({
            organization,
            permissions,
            pagination,
            actor,
            realm,
            mode,
            term,
        });
    }
}
