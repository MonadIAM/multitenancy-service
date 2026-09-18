import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { Validator } from "~common/validator";

@ApiSchema({ name: "TeamPatch" })
class PatchDTO {
    @Expose()
    @Validator.IsString()
    @Validator.MinLength(1)
    @Validator.MaxLength(128)
    @Validator.IsOptional()
    @ApiProperty({ required: false, type: String })
    declare public name?: string;

    @Expose()
    @Validator.IsString()
    @Validator.IsOptional()
    @ApiProperty({ required: false, type: String })
    declare public description?: string;
}

@ApiSchema({ name: "TeamUpdateBody" })
export class UpdateBodyDTO {
    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public reason: string;

    @Expose()
    @Type(() => PatchDTO)
    @Validator.IsRequired()
    @Validator.IsObject()
    @Validator.ValidateNested()
    @ApiProperty({ required: true, type: PatchDTO })
    declare public patch: PatchDTO;
}

@ApiSchema({ name: "TeamUpdateQuery" })
export class UpdateQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;
}
