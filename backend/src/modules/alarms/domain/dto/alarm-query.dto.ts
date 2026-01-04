import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AlarmSeverity, AlarmStatus } from './alarm.dto';

export class AlarmQueryDto {
  @ApiPropertyOptional({ description: 'Filter by machine ID' })
  @IsUUID()
  @IsOptional()
  machineId?: string;

  @ApiPropertyOptional({
    description: 'Filter by alarm status',
    enum: AlarmStatus,
  })
  @IsEnum(AlarmStatus)
  @IsOptional()
  status?: AlarmStatus;

  @ApiPropertyOptional({
    description: 'Filter by alarm severity',
    enum: AlarmSeverity,
  })
  @IsEnum(AlarmSeverity)
  @IsOptional()
  severity?: AlarmSeverity;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO format)',
    example: '2023-01-01T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO format)',
    example: '2023-12-31T23:59:59Z',
  })
  @IsISO8601()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
