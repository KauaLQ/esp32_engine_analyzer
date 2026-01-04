import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MetaDto } from './provision-request.dto';
import { MachineStatus } from '../../../../prisma/prisma.types';

export class UpdateMachineDto {
  @ApiProperty({
    example: 'operante',
    description: 'Status of the machine',
    enum: MachineStatus,
    required: false,
  })
  @IsEnum(MachineStatus)
  @IsOptional()
  status?: MachineStatus;

  @ApiProperty({
    example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
    description: 'ID of the operator user',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  operatorUserId?: string | null;

  @ApiProperty({
    example: 'WEG',
    description: 'Manufacturer of the machine',
    required: false,
  })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({
    example: 'W22',
    description: 'Model of the machine',
    required: false,
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({
    example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
    description: 'ID of the patio where the machine is located',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  patioId?: string | null;

  @ApiProperty({
    type: MetaDto,
    description: 'Additional metadata for the machine',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta?: Record<string, any>;
}
