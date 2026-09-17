import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { ActionType, EntityType } from "~context/enums";
import { Validator } from "~common/validator";

@ApiSchema({ name: "AuditLog" })
export class AuditLogDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsUUID()
    @ApiProperty({ required: false, type: String, format: "uuid" })
    declare public realm?: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsUUID()
    @ApiProperty({ required: false, type: String, format: "uuid" })
    declare public actor?: string;

    @Expose()
    @Validator.IsOptional()
    @ApiProperty({ required: false, type: Object, additionalProperties: true })
    declare public input?: ORM.UnknownType;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsString()
    @ApiProperty({ required: false, type: String })
    declare public ip?: string;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsString()
    @ApiProperty({ required: false, type: String })
    declare public userAgent?: string;

    @Expose()
    @Validator.IsEnum(ActionType)
    @ApiProperty({ required: true, enum: ActionType, enumName: "ActionType" })
    declare public actionType: ActionType;

    @Expose()
    @Validator.IsEnum(EntityType)
    @ApiProperty({ required: true, enum: EntityType, enumName: "EntityType" })
    declare public entityType: EntityType;

    @Expose()
    @Validator.IsDate()
    @ApiProperty({ required: true, type: Date })
    declare public createdAt: Date;
}
