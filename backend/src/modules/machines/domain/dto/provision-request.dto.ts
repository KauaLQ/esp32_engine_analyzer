import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MachineStatus } from '../../../../prisma/prisma.types';

export class MetaDto {
  @ApiProperty({
    example: 'MTR-001',
    description: 'Tag or identifier for the machine',
    required: false,
  })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({
    example: 15,
    description: 'Power in kilowatts',
    required: false,
  })
  @IsOptional()
  powerKw?: number;

  @ApiProperty({
    example: 220,
    description: 'Nominal voltage',
    required: false,
  })
  @IsOptional()
  voltageNominal?: number;

  @ApiProperty({
    example: 'Motor da linha 3',
    description: 'Additional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProvisionRequestDto {
  @ApiProperty({
    example: 'ROTORIAL-ESP32-A1B2C3',
    description: 'Unique identifier for the device',
  })
  @IsString()
  deviceId: string;

  @ApiProperty({
    example: 'MTR-001',
    description: 'External key for the machine',
  })
  @IsString()
  machineKey: string;

  @ApiProperty({
    example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
    description: 'ID of the patio where the machine is located',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  patioId?: string;

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
  })
  @IsUUID()
  @IsOptional()
  operatorUserId?: string;

  @ApiProperty({
    type: MetaDto,
    description: 'Additional metadata for the machine',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MetaDto)
  @IsOptional()
  meta?: MetaDto;

  @ApiProperty({
    example: '1.0.0',
    description: 'Firmware version of the device',
    required: false,
  })
  @IsString()
  @IsOptional()
  fwVersion?: string;
}
