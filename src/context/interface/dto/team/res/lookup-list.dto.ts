import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { TeamLookupDTO } from "./lookup-entity.dto";

@ApiSchema({ name: "TeamLookupList" })
export class LookupListDTO extends BaseListDTO<TeamLookupDTO> {
    @Type(() => TeamLookupDTO)
    @ApiProperty({ required: true, type: [TeamLookupDTO] })
    declare public data: TeamLookupDTO[];
}
