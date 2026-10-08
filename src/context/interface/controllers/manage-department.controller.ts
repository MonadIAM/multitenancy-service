import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { FormatResponse, RequireGlobalPermission, Swagger } from "~common/decorators";
import { DEPARTMENT_QUERIES } from "~context/application/queries";
import { PermissionCode } from "~context/enums";

import { ManageGetListQueryDTO, ManageGetListBodyDTO, ListDTO } from "../dto/department";

const { INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY, SERVICE_UNAVAILABLE, REQUEST_TIMEOUT, UNAUTHORIZED, FORBIDDEN, OK } =
    HttpStatus;

@ApiTags("Department")
@Controller("/department/manage")
export class DepartmentManageController {
    public constructor(
        @Inject(DEPARTMENT_QUERIES)
        private readonly queries: Queries.Department.PublicContract,
    ) {}

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
        @Body() { pagination, filters, sort }: ManageGetListBodyDTO,
        @Query() { view, mode }: ManageGetListQueryDTO,
    ): Queries.Department.FindMany.Result {
        return this.queries.findMany({ mode, pagination, filters, sort, view });
    }
}
