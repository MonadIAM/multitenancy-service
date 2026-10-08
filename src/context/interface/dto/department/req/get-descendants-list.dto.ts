import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { IsNotEmptyObject } from "class-validator";
import { Expose, Type } from "class-transformer";

import { BaseReadQueryDTO, PaginationDTO } from "~common/dto";
import { Validator } from "~common/validator";

import { FiltersDTO } from "../utils/filters.dto";

@ApiSchema({ name: "DepartmentDescendantsListBody" })
export class GetDescendantsListBodyDTO {
    @Expose()
    @IsNotEmptyObject()
    @Validator.ValidateNested()
    @Type(() => PaginationDTO)
    @ApiProperty({ required: true, type: PaginationDTO })
    declare public pagination: PaginationDTO;

    @Expose()
    @IsNotEmptyObject()
    @Validator.ValidateNested()
    @Type(() => FiltersDTO)
    @ApiProperty({ required: true, type: FiltersDTO })
    declare public filters: FiltersDTO;
}

@ApiSchema({ name: "DepartmentDescendantsListQuery" })
export class GetDescendantsListQueryDTO extends BaseReadQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public ancestor: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public organization: string;
}
