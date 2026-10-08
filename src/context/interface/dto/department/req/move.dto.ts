import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { ValidateIf } from "class-validator";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";
import { MoveMode } from "~context/enums";

@ApiSchema({ name: "DepartmentMoveBody" })
export class MoveBodyDTO {
    @Expose()
    @ValidateIf((_, value) => value !== null)
    @Validator.IsUUID()
    @ApiProperty({
        required: true,
        type: String,
        format: "uuid",
        nullable: true,
        description: "Null moves the department to the organization root",
    })
    declare public targetParent: Nullable<string>;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public target: string;

    @Expose()
    @Validator.IsEnum(MoveMode)
    @ApiProperty({ required: true, enum: MoveMode, enumName: "MoveMode" })
    declare public mode: MoveMode;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public reason: string;
}

@ApiSchema({ name: "DepartmentMoveQuery" })
export class MoveQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public organization: string;
}
