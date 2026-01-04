import { ApiProperty } from '@nestjs/swagger';
import { MachineStatus } from '../../../../prisma/prisma.types';

export class MachineResponseDto {
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

  @ApiProperty({
    example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
    description: 'ID of the patio where the machine is located',
    required: false,
  })
  patioId: string | null;

  @ApiProperty({
    example: 'WEG',
    description: 'Manufacturer of the machine',
    required: false,
  })
  manufacturer?: string;

  @ApiProperty({
    example: 'W22',
    description: 'Model of the machine',
    required: false,
  })
  model?: string;

  @ApiProperty({
    example: 'operante',
    description: 'Status of the machine',
    enum: MachineStatus,
  })
  status: MachineStatus;

  @ApiProperty({
    example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
    description: 'ID of the operator user',
    required: false,
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
}

export class DeviceResponseDto {
  @ApiProperty({
    example: 'ROTORIAL-ESP32-A1B2C3',
    description: 'Unique identifier for the device',
  })
  deviceId: string;

  @ApiProperty({
    example: '1.0.0',
    description: 'Firmware version of the device',
    required: false,
  })
  fwVersion?: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the device was paired with the machine',
  })
  pairedAt: Date | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the device was last seen',
    required: false,
  })
  lastSeenAt?: Date | null;
}

export class TelemetryInfoDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'ID of the machine for telemetry readings',
  })
  machineId: string;

  @ApiProperty({
    example: '/telemetry',
    description: 'HTTP endpoint for sending telemetry data',
  })
  httpEndpoint: string;
}

export class ProvisionResponseDto {
  @ApiProperty({
    type: MachineResponseDto,
    description: 'Machine information',
  })
  machine: MachineResponseDto;

  @ApiProperty({
    type: DeviceResponseDto,
    description: 'Device information',
  })
  device: DeviceResponseDto;

  @ApiProperty({
    type: TelemetryInfoDto,
    description: 'Telemetry information',
  })
  telemetry: TelemetryInfoDto;
}
