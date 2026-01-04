import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsUUID, Matches, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum BucketSize {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  ONE_DAY = '1d',
}

export enum FillType {
  NONE = 'none',
  NULL = 'null',
  ZERO = 'zero',
}

export class TelemetryQueryDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'Filter by machine ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  machineId?: string;

  @ApiProperty({
    example: '2025-12-26T00:00:00.000-03:00',
    description: 'Filter readings from this timestamp',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiProperty({
    example: '2025-12-26T23:59:59.999-03:00',
    description: 'Filter readings to this timestamp',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiProperty({
    example: 500,
    description: 'Maximum number of readings to return',
    required: false,
    default: 100,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number = 100;

  @ApiProperty({
    example: 'desc',
    description: 'Sort order',
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;
}

export class TelemetrySeriesQueryDto extends TelemetryQueryDto {
  @ApiProperty({
    example: '15m',
    description: 'Aggregation bucket size (1m, 5m, 15m, 30m, 1h, 6h, 1d)',
    required: false,
    enum: BucketSize,
  })
  @IsOptional()
  @IsEnum(BucketSize)
  bucket?: BucketSize;

  @ApiProperty({
    example: 'null',
    description: 'Gap filling strategy (none, null, zero)',
    required: false,
    enum: FillType,
    default: FillType.NONE,
  })
  @IsOptional()
  @IsEnum(FillType)
  fill?: FillType = FillType.NONE;
}

export class TelemetryMultiSeriesQueryDto extends TelemetrySeriesQueryDto {
  @ApiProperty({
    example: 'voltage,current,temperature',
    description: 'Comma-separated list of metrics to include (voltage, current, temperature)',
    required: false,
    default: 'voltage,current,temperature',
  })
  @IsOptional()
  metrics?: string = 'voltage,current,temperature';
}
