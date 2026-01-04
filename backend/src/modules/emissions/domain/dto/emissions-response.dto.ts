import { ApiProperty } from '@nestjs/swagger';
import { EmissionMetric, BucketInterval } from './emissions-query.dto';

export class EmissionsSeriesPointDto {
  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Timestamp for the data point',
  })
  ts: string;

  @ApiProperty({
    example: 2.5,
    description: 'Value for the data point',
  })
  value: number;
}

export class EmissionsSeriesResponseDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'Machine ID',
  })
  machineId: string;

  @ApiProperty({
    enum: EmissionMetric,
    example: EmissionMetric.KGCO2E,
    description: 'Metric being queried',
  })
  metric: EmissionMetric;

  @ApiProperty({
    enum: BucketInterval,
    example: BucketInterval.ONE_HOUR,
    description: 'Time bucket interval',
  })
  bucket: BucketInterval;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Start date of the query range',
  })
  from: string;

  @ApiProperty({
    example: '2023-01-02T00:00:00Z',
    description: 'End date of the query range',
  })
  to: string;

  @ApiProperty({
    type: [EmissionsSeriesPointDto],
    description: 'Series data points',
  })
  points: EmissionsSeriesPointDto[];
}

export class EmissionsSummaryResponseDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'Machine ID',
  })
  machineId: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Start date of the query range',
  })
  from: string;

  @ApiProperty({
    example: '2023-01-02T00:00:00Z',
    description: 'End date of the query range',
  })
  to: string;

  @ApiProperty({
    example: 24.5,
    description: 'Total energy consumption in kWh',
  })
  energyKwhTotal: number;

  @ApiProperty({
    example: 12.25,
    description: 'Total CO2 emissions in kgCO2e',
  })
  kgco2eTotal: number;

  @ApiProperty({
    example: 0.5,
    description: 'Emission factor used for calculations (kgCO2e per kWh)',
    nullable: true,
  })
  factorUsed: number | null;

  @ApiProperty({
    example: 24,
    description: 'Number of data points in the query range',
  })
  pointsCount: number;
}
