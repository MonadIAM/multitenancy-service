import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { AssignmentStatus } from "~context/enums";
import { Validator } from "~common/validator";

import { MembershipLookupDTO } from "../../membership";

@ApiSchema({ name: "ProjectAccountAssignmentLookup" })
export class ProjectAccountAssignmentLookupDTO {
    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ required: true, type: String, format: "uuid" })
    declare public id: string;

    @Expose()
    @Validator.ValidateNested()
    @Type(() => MembershipLookupDTO)
    @ApiProperty({ required: true, type: MembershipLookupDTO })
    declare public membership: MembershipLookupDTO;

    @Expose()
    @Validator.IsEnum(AssignmentStatus)
    @ApiProperty({
        required: true,
        enum: AssignmentStatus,
        enumName: "AssignmentStatus",
    })
    declare public status: AssignmentStatus;
}
