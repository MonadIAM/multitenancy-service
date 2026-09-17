import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { LinkFilterDTO, OrdinalFilterDTO, StringFilterDTO } from "~common/dto";
import { Validator } from "~common/validator";

@ApiSchema({ name: "TeamAccountAssignmentFilters" })
export class FiltersDTO implements Repositories.Mappers.TeamAccountAssignment.Filters {
    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => StringFilterDTO)
    @ApiProperty({ required: false, type: StringFilterDTO })
    public id?: StringFilterDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => LinkFilterDTO)
    @ApiProperty({ required: false, type: LinkFilterDTO })
    public organization?: LinkFilterDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => LinkFilterDTO)
    @ApiProperty({ required: false, type: LinkFilterDTO })
    public account?: LinkFilterDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => LinkFilterDTO)
    @ApiProperty({ required: false, type: LinkFilterDTO })
    public team?: LinkFilterDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => LinkFilterDTO)
    @ApiProperty({ required: false, type: LinkFilterDTO })
    public assignedBy?: LinkFilterDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => StringFilterDTO)
    @ApiProperty({ required: false, type: StringFilterDTO })
    public status?: StringFilterDTO;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => OrdinalFilterDTO)
    @ApiProperty({ required: false, type: OrdinalFilterDTO })
    public assignedAt?: OrdinalFilterDTO<Date>;

    @Expose()
    @Validator.IsOptional()
    @Validator.ValidateNested()
    @Type(() => OrdinalFilterDTO)
    @ApiProperty({ required: false, type: OrdinalFilterDTO })
    public updatedAt?: OrdinalFilterDTO<Date>;
}
