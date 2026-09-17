import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { ProjectAccountAssignmentDTO } from "./entity.dto";

@ApiSchema({ name: "ProjectAccountAssignmentList" })
export class ListDTO extends BaseListDTO<ProjectAccountAssignmentDTO> {
    @Type(() => ProjectAccountAssignmentDTO)
    @ApiProperty({ required: true, type: [ProjectAccountAssignmentDTO] })
    declare public data: ProjectAccountAssignmentDTO[];
}
