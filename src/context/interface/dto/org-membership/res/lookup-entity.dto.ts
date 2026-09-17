import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { OrgMembershipStatus } from "~context/enums";
import { Validator } from "~common/validator";

@ApiSchema({ name: "OrgMembershipLookup" })
export class OrgMembershipLookupDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public account: string;

    @Expose()
    @Validator.IsEnum(OrgMembershipStatus)
    @ApiProperty({
        required: true,
        enum: OrgMembershipStatus,
        enumName: "OrgMembershipStatus",
    })
    declare public status: OrgMembershipStatus;
}
