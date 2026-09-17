import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { DepartmentDTO } from "./entity.dto";

@ApiSchema({ name: "DepartmentList" })
export class ListDTO extends BaseListDTO<DepartmentDTO> {
    @Type(() => DepartmentDTO)
    @ApiProperty({ required: true, type: [DepartmentDTO] })
    declare public data: DepartmentDTO[];
}
