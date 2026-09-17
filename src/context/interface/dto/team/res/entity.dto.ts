import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { TeamStatus } from "~context/enums";
import { Validator } from "~common/validator";

import { TeamAccountAssignmentLookupDTO } from "../../team-account-assignment";
import { OrganizationLookupDTO } from "../../organization";
import { DepartmentLookupDTO } from "../../department";

@ApiSchema({ name: "Team" })
export class TeamDTO {
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
    @Validator.ValidateNested()
    @Type(() => DepartmentLookupDTO)
    @ApiProperty({ required: true, type: DepartmentLookupDTO })
    declare public department: DepartmentLookupDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => TeamAccountAssignmentLookupDTO)
    @ApiProperty({ required: false, type: TeamAccountAssignmentLookupDTO })
    declare public lead?: TeamAccountAssignmentLookupDTO;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public description: string;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ required: true, type: String })
    declare public name: string;

    @Expose()
    @Validator.IsEnum(TeamStatus)
    @ApiProperty({ required: true, enum: TeamStatus, enumName: "TeamStatus" })
    declare public status: TeamStatus;

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
