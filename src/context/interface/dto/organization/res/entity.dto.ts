import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { OrganizationStatus } from "~context/enums";
import { Validator } from "~common/validator";

import { OrgMembershipLookupDTO } from "../../org-membership";

@ApiSchema({ name: "Organization" })
export class OrganizationDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsUUID()
    @ApiProperty({ required: false, type: String, format: "uuid" })
    declare public process?: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsString()
    @ApiProperty({ required: false, type: String })
    declare public failure?: string;

    @Expose()
    @Validator.ValidateNested()
    @Type(() => OrgMembershipLookupDTO)
    @ApiProperty({ required: true, type: OrgMembershipLookupDTO })
    declare public owner: OrgMembershipLookupDTO;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public title: string;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public description: string;

    @Expose()
    @Validator.IsEnum(OrganizationStatus)
    @ApiProperty({
        required: true,
        enum: OrganizationStatus,
        enumName: "OrganizationStatus",
    })
    declare public status: OrganizationStatus;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsDate()
    @ApiProperty({ required: false, type: Date })
    declare public revokedAt?: Date;

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
    @Validator.IsInt()
    @ApiProperty({ required: true, type: Number })
    declare public version: number;
}
