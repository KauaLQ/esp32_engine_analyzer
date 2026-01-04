import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum EmissionMetric {
  POWER_KW = 'power_kw',
  ENERGY_KWH = 'energy_kwh',
  KGCO2E = 'kgco2e',
}

export enum BucketInterval {
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  ONE_DAY = '1d',
}

export class EmissionsQueryDto {
  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Start date for the query (ISO format)',
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiProperty({
    example: '2023-01-02T00:00:00Z',
    description: 'End date for the query (ISO format)',
  })
  @IsDateString()
  @IsOptional()
  to?: string;
}

export class EmissionsSeriesQueryDto extends EmissionsQueryDto {
  @ApiProperty({
    enum: BucketInterval,
    example: BucketInterval.ONE_HOUR,
    description: 'Time bucket interval',
    default: BucketInterval.ONE_HOUR,
  })
  @IsEnum(BucketInterval)
  @IsOptional()
  bucket?: BucketInterval = BucketInterval.ONE_HOUR;

  @ApiProperty({
    enum: EmissionMetric,
    example: EmissionMetric.KGCO2E,
    description: 'Metric to query',
    default: EmissionMetric.KGCO2E,
  })
  @IsEnum(EmissionMetric)
  @IsOptional()
  metric?: EmissionMetric = EmissionMetric.KGCO2E;
}
