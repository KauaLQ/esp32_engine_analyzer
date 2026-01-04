import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateTelemetryDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'The ID of the machine',
  })
  @IsUUID()
  machineId: string;

  @ApiProperty({
    example: 221.7,
    description: 'The voltage in volts',
  })
  @IsNumber()
  @Min(0)
  voltageV: number;

  @ApiProperty({
    example: 12.4,
    description: 'The current in amperes',
  })
  @IsNumber()
  @Min(0)
  currentA: number;

  @ApiProperty({
    example: 49.2,
    description: 'The temperature in Celsius',
  })
  @IsNumber()
  temperatureC: number;

  @ApiProperty({
    example: 120,
    description: 'The sequence number',
  })
  @IsNumber()
  @IsPositive()
  seq: number;
}
