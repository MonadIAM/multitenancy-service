import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { ChangeSetType } from "@mikro-orm/postgresql";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";
import { EntityType } from "~context/enums";

@ApiSchema({ name: "ChangeLog" })
export class ChangeLogDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public auditEntry: string;

    @Expose()
    @Validator.IsEnum(ChangeSetType)
    @ApiProperty({
        required: true,
        enum: ChangeSetType,
        enumName: "ChangeSetType",
    })
    declare public changeType: ChangeSetType;

    @Expose()
    @Validator.IsEnum(EntityType)
    @ApiProperty({ required: true, enum: EntityType, enumName: "EntityType" })
    declare public entityType: EntityType;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public entity: string;

    @Expose()
    @ApiProperty({ required: true, type: Object, additionalProperties: true })
    declare public delta: ORM.UnknownType;

    @Expose()
    @Validator.IsDate()
    @ApiProperty({ required: true, type: Date })
    declare public createdAt: Date;
}
