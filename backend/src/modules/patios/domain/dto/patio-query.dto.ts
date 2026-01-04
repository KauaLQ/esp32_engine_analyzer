import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class PatioQueryDto {
  @ApiPropertyOptional({
    description: 'Search term to filter patios by name',
    example: 'Pátio',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of patios to return',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Sort order for results',
    enum: OrderDirection,
    default: OrderDirection.DESC,
  })
  @IsEnum(OrderDirection)
  @IsOptional()
  order?: OrderDirection = OrderDirection.DESC;
}
