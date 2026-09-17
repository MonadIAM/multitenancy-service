import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { OrganizationLookupDTO } from "./lookup-entity.dto";

@ApiSchema({ name: "OrganizationLookupList" })
export class LookupListDTO extends BaseListDTO<OrganizationLookupDTO> {
    @Type(() => OrganizationLookupDTO)
    @ApiProperty({ required: true, type: [OrganizationLookupDTO] })
    declare public data: OrganizationLookupDTO[];
}
