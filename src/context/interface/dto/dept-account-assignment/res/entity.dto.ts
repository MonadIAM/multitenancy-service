import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { AssignmentStatus } from "~context/enums";
import { Validator } from "~common/validator";

import { OrgMembershipLookupDTO } from "../../org-membership";
import { OrganizationLookupDTO } from "../../organization";
import { DepartmentLookupDTO } from "../../department";

@ApiSchema({ name: "DeptAccountAssignment" })
export class DeptAccountAssignmentDTO {
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
    @Type(() => OrgMembershipLookupDTO)
    @ApiProperty({ required: true, type: OrgMembershipLookupDTO })
    declare public membership: OrgMembershipLookupDTO;

    @Expose()
    @Validator.ValidateNested()
    @Type(() => DepartmentLookupDTO)
    @ApiProperty({ required: true, type: DepartmentLookupDTO })
    declare public department: DepartmentLookupDTO;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public assignedBy: string;

    @Expose()
    @Validator.IsEnum(AssignmentStatus)
    @ApiProperty({
        required: true,
        enum: AssignmentStatus,
        enumName: "AssignmentStatus",
    })
    declare public status: AssignmentStatus;

    @Expose()
    @Validator.IsDate()
    @ApiProperty({ required: true, type: Date })
    declare public assignedAt: Date;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsDate()
    @ApiProperty({ required: false, type: Date })
    declare public updatedAt?: Date;

    @Expose()
    @Validator.IsInt()
    @ApiProperty({ required: true, type: Number })
    declare public version: number;
}
