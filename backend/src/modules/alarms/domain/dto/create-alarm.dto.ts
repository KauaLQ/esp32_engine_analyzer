import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { AlarmSeverity } from './alarm.dto';

export class CreateAlarmDto {
  @ApiProperty({ description: 'Machine ID' })
  @IsUUID()
  @IsNotEmpty()
  machineId: string;

  @ApiPropertyOptional({
    description: 'Alarm type',
    default: 'manual',
    example: 'manual',
  })
  @IsString()
  @IsOptional()
  type?: string = 'manual';

  @ApiProperty({
    description: 'Alarm severity',
    enum: AlarmSeverity,
    example: AlarmSeverity.WARN,
  })
  @IsEnum(AlarmSeverity)
  @IsNotEmpty()
  severity: AlarmSeverity;

  @ApiProperty({
    description: 'Alarm title',
    example: 'High temperature detected',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Alarm details',
    type: 'object',
    additionalProperties: true,
    example: {
      metric: 'temperature',
      value: 95,
      limit: 90,
      unit: 'C',
    },
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Deduplication key',
    example: 'manual:high-temp',
  })
  @IsString()
  @IsOptional()
  dedupeKey?: string;
}
