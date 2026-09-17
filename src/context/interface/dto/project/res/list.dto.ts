import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { ProjectDTO } from "./entity.dto";

@ApiSchema({ name: "ProjectList" })
export class ListDTO extends BaseListDTO<ProjectDTO> {
    @Type(() => ProjectDTO)
    @ApiProperty({ required: true, type: [ProjectDTO] })
    declare public data: ProjectDTO[];
}
