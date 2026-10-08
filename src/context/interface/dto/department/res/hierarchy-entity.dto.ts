import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";

import { DepartmentDTO } from "./entity.dto";

@ApiSchema({ name: "DepartmentHierarchy" })
export class DepartmentHierarchyDTO extends DepartmentDTO {
    @Expose()
    @Validator.IsInt()
    @ApiProperty({ required: true, type: Number })
    declare public depth: number;
}
