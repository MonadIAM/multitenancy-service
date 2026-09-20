import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";

@ApiSchema({ name: "InviteCreateBody" })
export class CreateBodyDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public organization: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public invitee: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsUUID()
    @ApiProperty({ required: false, type: String, format: "uuid" })
    declare public role?: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsDate()
    @ApiProperty({ required: false, type: Date })
    declare public expiresAt?: Date;
}

@ApiSchema({ name: "InviteCreateQuery" })
export class CreateQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;
}
