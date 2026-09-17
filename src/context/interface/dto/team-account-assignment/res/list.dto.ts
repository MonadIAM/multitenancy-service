import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { TeamAccountAssignmentDTO } from "./entity.dto";

@ApiSchema({ name: "TeamAccountAssignmentList" })
export class ListDTO extends BaseListDTO<TeamAccountAssignmentDTO> {
    @Type(() => TeamAccountAssignmentDTO)
    @ApiProperty({ required: true, type: [TeamAccountAssignmentDTO] })
    declare public data: TeamAccountAssignmentDTO[];
}
