import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { TeamDTO } from "./entity.dto";

@ApiSchema({ name: "TeamList" })
export class ListDTO extends BaseListDTO<TeamDTO> {
    @Type(() => TeamDTO)
    @ApiProperty({ required: true, type: [TeamDTO] })
    declare public data: TeamDTO[];
}
