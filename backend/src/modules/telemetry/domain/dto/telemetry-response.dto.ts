import { ApiProperty } from '@nestjs/swagger';

export class TelemetryReadingDto {

  @ApiProperty({
    example: '123',
    description: 'The ID of the telemetry reading',
  })
  id: string;

  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'The ID of the machine',
  })
  machineId: string;

  @ApiProperty({
    example: '2025-12-26T11:40:10.000-03:00',
    description: 'The timestamp of the telemetry reading',
  })
  ts: string;

  @ApiProperty({
    example: 221.7,
    description: 'The voltage in volts',
  })
  voltageV: number;

  @ApiProperty({
    example: 12.4,
    description: 'The current in amperes',
  })
  currentA: number;

  @ApiProperty({
    example: 49.2,
    description: 'The temperature in Celsius',
  })
  temperatureC: number;

  @ApiProperty({
    example: 120,
    description: 'The sequence number',
  })
  seq: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'The data returned by the query',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Metadata about the response',
    example: {
      total: 150,
      page: 1,
      limit: 100,
      hasMore: true,
    },
  })
  meta: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    bucket?: string;
    fill?: string;
    from?: string;
    to?: string;
    [key: string]: any;
  };
}

export class TelemetryReadingsResponseDto extends PaginatedResponseDto<TelemetryReadingDto> {
  @ApiProperty({
    description: 'The telemetry readings',
    type: [TelemetryReadingDto],
  })
  declare data: TelemetryReadingDto[];
}

export class TelemetrySeriesPointDto {
  @ApiProperty({
    example: '2025-12-26T11:40:00.000-03:00',
    description: 'The timestamp of the data point',
  })
  ts: string;

  @ApiProperty({
    example: 221.7,
    description: 'The value of the data point',
    nullable: true,
  })
  value: number | null;
}

export class TelemetrySeriesResponseDto extends PaginatedResponseDto<TelemetrySeriesPointDto> {
  @ApiProperty({
    description: 'The series data points',
    type: [TelemetrySeriesPointDto],
  })
  declare data: TelemetrySeriesPointDto[];
}

export class TelemetryMultiSeriesValuesDto {
  @ApiProperty({
    example: 221.7,
    description: 'The voltage value in volts',
    nullable: true,
    required: false,
  })
  voltageV?: number | null;

  @ApiProperty({
    example: 12.4,
    description: 'The current value in amperes',
    nullable: true,
    required: false,
  })
  currentA?: number | null;

  @ApiProperty({
    example: 49.2,
    description: 'The temperature value in Celsius',
    nullable: true,
    required: false,
  })
  temperatureC?: number | null;
}

export class TelemetryMultiSeriesPointDto {
  @ApiProperty({
    example: '2025-12-26T11:40:00.000-03:00',
    description: 'The timestamp of the data point',
  })
  ts: string;

  @ApiProperty({
    description: 'The values of the data point for each metric',
    type: TelemetryMultiSeriesValuesDto,
  })
  values: TelemetryMultiSeriesValuesDto;
}

export class TelemetryMultiSeriesResponseDto extends PaginatedResponseDto<TelemetryMultiSeriesPointDto> {
  @ApiProperty({
    description: 'The multi-series data points',
    type: [TelemetryMultiSeriesPointDto],
  })
  declare data: TelemetryMultiSeriesPointDto[];
}
