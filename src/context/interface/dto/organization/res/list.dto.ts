import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { OrganizationDTO } from "./entity.dto";

@ApiSchema({ name: "OrganizationList" })
export class ListDTO extends BaseListDTO<OrganizationDTO> {
    @Type(() => OrganizationDTO)
    @ApiProperty({ required: true, type: [OrganizationDTO] })
    declare public data: OrganizationDTO[];
}
