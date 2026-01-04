import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MachineStatus } from '../../../../prisma/prisma.types';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum OrderField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class MachineQueryDto {
  @ApiProperty({
    description: 'Search term for machineKey or name',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by machine status',
    enum: MachineStatus,
    required: false,
  })
  @IsEnum(MachineStatus)
  @IsOptional()
  status?: MachineStatus;

  @ApiProperty({
    description: 'Filter by patio ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  patioId?: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
    default: 50,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 50;

  @ApiProperty({
    description: 'Sort direction',
    enum: OrderDirection,
    default: OrderDirection.DESC,
    required: false,
  })
  @IsEnum(OrderDirection)
  @IsOptional()
  order?: OrderDirection = OrderDirection.DESC;

  @ApiProperty({
    description: 'Field to sort by',
    enum: OrderField,
    default: OrderField.UPDATED_AT,
    required: false,
  })
  @IsEnum(OrderField)
  @IsOptional()
  orderBy?: OrderField = OrderField.UPDATED_AT;
}
