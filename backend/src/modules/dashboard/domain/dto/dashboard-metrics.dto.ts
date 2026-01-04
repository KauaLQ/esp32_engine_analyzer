import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class DashboardMetricsQueryDto {
  @ApiPropertyOptional({
    description: 'Start timestamp (ISO8601)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({
    description: 'End timestamp (ISO8601)',
    example: '2023-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}

/* ===== Response DTOs ===== */

export class AlarmsByStatusDto {
  @ApiProperty({ example: 3 }) open: number;
  @ApiProperty({ example: 2 }) ack: number;
  @ApiProperty({ example: 10 }) closed: number;
}

export class AlarmsBySeverityDto {
  @ApiProperty({ example: 5 }) info: number;
  @ApiProperty({ example: 7 }) warn: number;
  @ApiProperty({ example: 3 }) crit: number;
}

export class OpenAlarmsBySeverityDto {
  @ApiProperty({ example: 0 }) info: number;
  @ApiProperty({ example: 2 }) warn: number;
  @ApiProperty({ example: 1 }) crit: number;
}

export class AlarmsDto {
  @ApiProperty({ type: AlarmsByStatusDto }) byStatus: AlarmsByStatusDto;
  @ApiProperty({ type: AlarmsBySeverityDto }) bySeverity: AlarmsBySeverityDto;
  @ApiProperty({ type: OpenAlarmsBySeverityDto }) openBySeverity: OpenAlarmsBySeverityDto;
}

export class GlobalStatsDto {
  @ApiProperty({ example: 12 }) machinesTotal: number;
  @ApiProperty({ example: 4 }) patiosTotal: number;
  @ApiProperty({ type: AlarmsDto }) alarms: AlarmsDto;
}

export class AveragesDto {
  @ApiProperty({ example: 221.7, nullable: true }) avgVoltageV: number | null;
  @ApiProperty({ example: 12.4, nullable: true }) avgCurrentA: number | null;
  @ApiProperty({ example: 49.2, nullable: true }) avgTemperatureC: number | null;
  @ApiProperty({ example: 75.5, nullable: true }) avgPowerKw: number | null;
  @ApiProperty({ example: 150.2, nullable: true }) avgEnergyKwh: number | null;
  @ApiProperty({ example: 30.5, nullable: true }) avgKgco2e: number | null;
}

export class DashboardMetricsResponseDto {
  @ApiProperty({ type: GlobalStatsDto }) globalStats: GlobalStatsDto;
  @ApiProperty({ type: AveragesDto }) averages: AveragesDto;
}
