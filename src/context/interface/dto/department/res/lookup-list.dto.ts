import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { DepartmentLookupDTO } from "./lookup-entity.dto";

@ApiSchema({ name: "DepartmentLookupList" })
export class LookupListDTO extends BaseListDTO<DepartmentLookupDTO> {
    @Type(() => DepartmentLookupDTO)
    @ApiProperty({ required: true, type: [DepartmentLookupDTO] })
    declare public data: DepartmentLookupDTO[];
}
