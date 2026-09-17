import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { DeptAccountAssignmentDTO } from "./entity.dto";

@ApiSchema({ name: "DeptAccountAssignmentList" })
export class ListDTO extends BaseListDTO<DeptAccountAssignmentDTO> {
    @Type(() => DeptAccountAssignmentDTO)
    @ApiProperty({ required: true, type: [DeptAccountAssignmentDTO] })
    declare public data: DeptAccountAssignmentDTO[];
}
