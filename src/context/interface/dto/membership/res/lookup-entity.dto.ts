import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { MembershipStatus } from "~context/enums";
import { Validator } from "~common/validator";

@ApiSchema({ name: "MembershipLookup" })
export class MembershipLookupDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public account: string;

    @Expose()
    @Validator.IsEnum(MembershipStatus)
    @ApiProperty({
        required: true,
        enum: MembershipStatus,
        enumName: "MembershipStatus",
    })
    declare public status: MembershipStatus;
}
