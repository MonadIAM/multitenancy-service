import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { InviteStatus } from "~context/enums";
import { Validator } from "~common/validator";

import { OrganizationLookupDTO } from "../../organization";

@ApiSchema({ name: "Invite" })
export class InviteDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.ValidateNested()
    @Type(() => OrganizationLookupDTO)
    @ApiProperty({ required: true, type: OrganizationLookupDTO })
    declare public organization: OrganizationLookupDTO;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public invitee: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public inviter: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public role: string;

    @Expose()
    @Validator.IsEnum(InviteStatus)
    @ApiProperty({
        required: true,
        enum: InviteStatus,
        enumName: "InviteStatus",
    })
    declare public status: InviteStatus;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsDate()
    @ApiProperty({ required: false, type: Date })
    declare public updatedAt?: Date;

    @Expose()
    @Validator.IsDate()
    @ApiProperty({ required: true, type: Date })
    declare public createdAt: Date;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsDate()
    @ApiProperty({ required: false, type: Date })
    declare public expiresAt?: Date;

    @Expose()
    @Validator.IsInt()
    @ApiProperty({ required: true, type: Number })
    declare public version: number;
}
