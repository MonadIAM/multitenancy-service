import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";

@ApiSchema({ name: "DepartmentArchiveBody" })
export class ArchiveBodyDTO {
    @Expose()
    @Validator.IsUniqueArray()
    @Validator.ArrayMinSize(1)
    @Validator.ArrayMaxSize(Number(process.env.BULK_OPERATION_LIMIT))
    @Validator.IsUUID("4", { each: true })
    @ApiProperty({ required: true, type: [String], format: "uuid" })
    declare public identifiers: string[];

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public reason: string;
}

@ApiSchema({ name: "DepartmentArchiveQuery" })
export class ArchiveQueryDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public realm: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public organization: string;
}
