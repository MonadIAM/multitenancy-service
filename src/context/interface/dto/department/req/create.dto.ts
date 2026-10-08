import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";

@ApiSchema({ name: "DepartmentCreateBody" })
export class CreateBodyDTO {
    @Expose()
    @Validator.IsOptional()
    @Validator.IsUUID()
    @ApiProperty({ required: false, type: String, format: "uuid" })
    declare public parent?: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsArray()
    @Validator.IsUUID(undefined, { each: true })
    @ApiProperty({ required: false, type: [String] })
    declare public children?: string[];

    @Expose()
    @Validator.IsString()
    @Validator.MinLength(1)
    @Validator.MaxLength(128)
    @ApiProperty({ required: true, type: String })
    declare public name: string;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public description: string;
}

@ApiSchema({ name: "DepartmentCreateQuery" })
export class CreateQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public organization: string;
}
