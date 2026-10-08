import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { BaseListDTO } from "~common/dto";

import { DepartmentHierarchyDTO } from "./hierarchy-entity.dto";

@ApiSchema({ name: "DepartmentHierarchyList" })
export class HierarchyListDTO extends BaseListDTO<DepartmentHierarchyDTO> {
    @Type(() => DepartmentHierarchyDTO)
    @ApiProperty({ required: true, type: [DepartmentHierarchyDTO] })
    declare public data: DepartmentHierarchyDTO[];
}
