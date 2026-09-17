import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { QueryOrder } from "@mikro-orm/postgresql";
import { Expose } from "class-transformer";

import { Validator } from "~common/validator";

@ApiSchema({ name: "OrgMembershipSort" })
export class SortDTO implements Repositories.Mappers.OrgMembership.Sort {
    @Expose()
    @Validator.IsOptional()
    @Validator.IsEnum(QueryOrder)
    @ApiProperty({ required: false, enum: QueryOrder, enumName: "QueryOrder" })
    public suspendedAt?: QueryOrder;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsEnum(QueryOrder)
    @ApiProperty({ required: false, enum: QueryOrder, enumName: "QueryOrder" })
    public blockedAt?: QueryOrder;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsEnum(QueryOrder)
    @ApiProperty({ required: false, enum: QueryOrder, enumName: "QueryOrder" })
    public updatedAt?: QueryOrder;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsEnum(QueryOrder)
    @ApiProperty({ required: false, enum: QueryOrder, enumName: "QueryOrder" })
    public createdAt?: QueryOrder;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsEnum(QueryOrder)
    @ApiProperty({ required: false, enum: QueryOrder, enumName: "QueryOrder" })
    public joinedAt?: QueryOrder;

    @Expose()
    @Validator.IsOptional()
    @Validator.IsEnum(QueryOrder)
    @ApiProperty({ required: false, enum: QueryOrder, enumName: "QueryOrder" })
    public leftAt?: QueryOrder;
}
