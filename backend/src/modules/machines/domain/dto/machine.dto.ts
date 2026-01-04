import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MachineStatus } from '../../../../prisma/prisma.types';

export class DeviceDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'Unique identifier for the device',
  })
  id: string;

  @ApiProperty({
    example: 'ROTORIAL-ESP32-A1B2C3',
    description: 'Device identifier',
  })
  deviceId: string;

  @ApiPropertyOptional({
    example: '1.0.0',
    description: 'Firmware version',
    nullable: true,
  })
  fwVersion?: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the device was last seen',
    nullable: true,
  })
  lastSeenAt?: Date | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the device was paired with the machine',
    nullable: true,
  })
  pairedAt?: Date | null;
}

export class MachineDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'Unique identifier for the machine',
  })
  id: string;

  @ApiProperty({
    example: 'MTR-001',
    description: 'External key for the machine',
  })
  machineKey: string;

  @ApiPropertyOptional({
    example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
    description: 'ID of the patio where the machine is located',
    nullable: true,
  })
  patioId?: string | null;

  @ApiPropertyOptional({
    example: 'WEG',
    description: 'Manufacturer of the machine',
    nullable: true,
  })
  manufacturer?: string | null;

  @ApiPropertyOptional({
    example: 'W22',
    description: 'Model of the machine',
    nullable: true,
  })
  model?: string | null;

  @ApiProperty({
    example: 'operante',
    description: 'Status of the machine',
    enum: MachineStatus,
  })
  status: MachineStatus;

  @ApiPropertyOptional({
    example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
    description: 'ID of the operator user',
    nullable: true,
  })
  operatorUserId?: string | null;

  @ApiProperty({
    example: {
      tag: 'MTR-001',
      powerKw: 15,
      voltageNominal: 220,
      notes: 'Motor da linha 3',
    },
    description: 'Additional metadata for the machine',
  })
  meta: Record<string, any>;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: DeviceDto,
    description: 'Associated device',
    nullable: true,
  })
  device?: DeviceDto;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the device was last seen',
    nullable: true,
  })
  lastSeenAt?: Date | null;
}

export class MachineDetailDto extends MachineDto {
  @ApiPropertyOptional({
    example: {
      voltageV: 221.7,
      currentA: 12.4,
      temperatureC: 49.2,
      seq: 120,
    },
    description: 'Latest telemetry reading',
    nullable: true,
  })
  latestReading?: Record<string, any>;
}
