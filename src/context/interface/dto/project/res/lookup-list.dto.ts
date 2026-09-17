import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { ProjectLookupDTO } from "./lookup-entity.dto";

@ApiSchema({ name: "ProjectLookupList" })
export class LookupListDTO extends BaseListDTO<ProjectLookupDTO> {
    @Type(() => ProjectLookupDTO)
    @ApiProperty({ required: true, type: [ProjectLookupDTO] })
    declare public data: ProjectLookupDTO[];
}
