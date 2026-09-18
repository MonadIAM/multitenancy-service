import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { ValidateIf } from "class-validator";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";

@ApiSchema({ name: "ProjectChangeManagerBody" })
export class ChangeManagerBodyDTO {
    @Expose()
    @ValidateIf((_, value) => value !== null)
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid", nullable: true })
    declare public assignment: Nullable<string>;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public reason: string;
}

@ApiSchema({ name: "ProjectChangeManagerQuery" })
export class ChangeManagerQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;
}
