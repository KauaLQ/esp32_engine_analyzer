import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDirection } from './patio-query.dto';
import { MachineStatus } from '../../../../prisma/prisma.types';

export class MachinesInPatioQueryDto {
  @ApiPropertyOptional({
    description: 'Search term to filter machines by machine_key or name',
    example: 'machine-001',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter machines by status',
    enum: MachineStatus,
  })
  @IsEnum(MachineStatus)
  @IsOptional()
  status?: MachineStatus;

  @ApiPropertyOptional({
    description: 'Maximum number of machines to return',
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
