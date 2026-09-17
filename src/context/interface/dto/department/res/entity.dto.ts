import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { DepartmentStatus } from "~context/enums";
import { Validator } from "~common/validator";

import { DeptAccountAssignmentLookupDTO } from "../../dept-account-assignment";
import { OrganizationLookupDTO } from "../../organization";

@ApiSchema({ name: "Department" })
export class DepartmentDTO {
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
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => DeptAccountAssignmentLookupDTO)
    @ApiProperty({ required: false, type: DeptAccountAssignmentLookupDTO })
    declare public manager?: DeptAccountAssignmentLookupDTO;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public description: string;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public name: string;

    @Expose()
    @Validator.IsEnum(DepartmentStatus)
    @ApiProperty({
        required: true,
        enum: DepartmentStatus,
        enumName: "DepartmentStatus",
    })
    declare public status: DepartmentStatus;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsDate()
    @ApiProperty({ required: false, type: Date })
    declare public archivedAt?: Date;

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
