import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { OrgMembershipDTO } from "./entity.dto";

@ApiSchema({ name: "OrgMembershipList" })
export class ListDTO extends BaseListDTO<OrgMembershipDTO> {
    @Type(() => OrgMembershipDTO)
    @ApiProperty({ required: true, type: [OrgMembershipDTO] })
    declare public data: OrgMembershipDTO[];
}
