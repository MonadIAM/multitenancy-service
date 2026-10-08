import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { DepartmentStatus } from "~context/enums";
import { Validator } from "~common/validator";

@ApiSchema({ name: "DepartmentGraphNodeAttributes" })
class NodeAttributesDTO {
    @Expose()
    @Validator.IsEnum(DepartmentStatus)
    @ApiProperty({ enum: DepartmentStatus, enumName: "DepartmentStatus" })
    declare public status: DepartmentStatus;
}

@ApiSchema({ name: "DepartmentGraphNode" })
class NodeDTO {
    @Expose()
    @Validator.IsString()
    @ApiProperty({ type: String })
    declare public id: string;

    @Expose()
    @Validator.IsString()
    @ApiProperty({ type: String })
    declare public label: string;

    @Expose()
    @Validator.ValidateNested()
    @Type(() => NodeAttributesDTO)
    @ApiProperty({ type: NodeAttributesDTO })
    declare public attributes: NodeAttributesDTO;
}

@ApiSchema({ name: "DepartmentGraphEdge" })
class EdgeDTO {
    @Expose()
    @Validator.IsString()
    @ApiProperty({ type: String })
    declare public id: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ type: String, format: "uuid" })
    declare public source: string;

    @Expose()
    @Validator.IsUUID()
    @ApiProperty({ type: String, format: "uuid" })
    declare public target: string;
}

@ApiSchema({ name: "DepartmentHierarchyGraph" })
export class DepartmentHierarchyGraphDTO {
    @Expose()
    @Validator.IsArray()
    @Validator.ValidateNested({ each: true })
    @Type(() => NodeDTO)
    @ApiProperty({ type: [NodeDTO] })
    declare public nodes: NodeDTO[];

    @Expose()
    @Validator.IsArray()
    @Validator.ValidateNested({ each: true })
    @Type(() => EdgeDTO)
    @ApiProperty({ type: [EdgeDTO] })
    declare public edges: EdgeDTO[];
}
