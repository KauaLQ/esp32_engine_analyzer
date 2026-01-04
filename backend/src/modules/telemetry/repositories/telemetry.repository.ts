import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { JsonValue } from '../../../prisma/prisma.types';
import { CreateTelemetryDto } from '../domain/dto/create-telemetry.dto';
import {
  BucketSize,
  FillType,
  SortOrder,
  TelemetryMultiSeriesQueryDto,
  TelemetryQueryDto,
  TelemetrySeriesQueryDto,
} from '../domain/dto/telemetry-query.dto';
import {
  TelemetryMultiSeriesPointDto,
  TelemetryMultiSeriesValuesDto,
  TelemetryReadingDto,
} from '../domain/dto/telemetry-response.dto';

import { toTelemetryPayload, TelemetryPayload } from './telemetry-payload';

type Metric = 'voltage' | 'current' | 'temperature';
type TelemetryWhere = Record<string, any>;

@Injectable()
export class TelemetryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTelemetryDto: CreateTelemetryDto): Promise<TelemetryReadingDto> {
    const { machineId, voltageV, currentA, temperatureC, seq } = createTelemetryDto;

    const reading = await this.prisma.telemetry_readings.create({
      data: {
        machine_id: machineId,
        ts: new Date(), // server ts
        payload: { voltageV, currentA, temperatureC, seq },
      },
    });

    return this.mapTelemetryReading(reading);
  }

  async findAll(query: TelemetryQueryDto): Promise<{
    data: TelemetryReadingDto[];
    total: number;
    limit: number;
    hasMore: boolean;
  }> {
    const { machineId, from, to, limit = 100, order = SortOrder.DESC } = query;

    const where: TelemetryWhere = {
      ...(machineId ? { machine_id: machineId } : {}),
      ...this.buildTsWhere(from, to),
    };

    const [data, total] = await Promise.all([
      this.prisma.telemetry_readings.findMany({
        where,
        orderBy: { ts: order === SortOrder.DESC ? 'desc' : 'asc' },
        take: limit,
      }),
      this.prisma.telemetry_readings.count({ where }),
    ]);

    return {
      data: data.map((r) => this.mapTelemetryReading(r)),
      total,
      limit,
      hasMore: total > limit,
    };
  }

  async findLatest(machineId: string): Promise<TelemetryReadingDto | null> {
    const reading = await this.prisma.telemetry_readings.findFirst({
      where: { machine_id: machineId },
      orderBy: { ts: 'desc' },
    });

    return reading ? this.mapTelemetryReading(reading) : null;
  }

  async findSeries(
    metric: Metric,
    query: TelemetrySeriesQueryDto,
  ): Promise<{
    data: { ts: string; value: number | null }[];
    total: number;
    bucket?: string;
    fill?: string;
    from?: string;
    to?: string;
  }> {
    const { machineId, from, to, bucket, fill = FillType.NONE, limit } = query;

    if (!machineId) throw new Error('Machine ID is required for series data');

    const fromDate = from
      ? new Date(from)
      : new Date(new Date().getTime() - 24 * 60 * 60 * 1000); // Default to 24h ago
    const toDate = to ? new Date(to) : new Date(); // Default to now

    // Without bucket: raw points (simpler and safer)
    if (!bucket) {
      const readings = await this.prisma.telemetry_readings.findMany({
        where: {
          machine_id: machineId,
          ts: {
            gte: fromDate,
            lte: toDate,
          },
        },
        orderBy: { ts: 'asc' },
        ...(limit ? { take: limit } : {}),
      });

      const metricKey = this.getMetricKey(metric);

      const data = readings.map((r) => {
        const payload = toTelemetryPayload(r.payload);
        const value = payload[metricKey];
        return {
          ts: r.ts.toISOString(),
          value: typeof value === 'number' ? value : (value ?? null),
        };
      });

      return {
        data,
        total: data.length,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      };
    }

    // With bucket: aggregate via SQL (REFATORADO + FIX uuid=text)
    const bucketMinutes = this.parseBucketMinutes(bucket);
    if (!bucketMinutes) throw new Error('Invalid bucket format');

    const result = limit
      ? await this.prisma.$queryRaw<{ ts: Date; value: number | null }[]>`
          SELECT
            date_trunc('hour', ts)
            + (INTERVAL '1 minute' * ${bucketMinutes}::int)
            * FLOOR(EXTRACT(MINUTE FROM ts) / ${bucketMinutes}::int) AS ts,
            AVG(
              CASE ${metric}
                WHEN 'voltage' THEN (payload->>'voltageV')::float
                WHEN 'current' THEN (payload->>'currentA')::float
                WHEN 'temperature' THEN (payload->>'temperatureC')::float
              END
            ) AS value
          FROM telemetry_readings
          WHERE
            machine_id = ${machineId}::uuid
            AND ts >= ${fromDate}
            AND ts <= ${toDate}
          GROUP BY 1
          ORDER BY 1 ASC
          LIMIT ${limit}
        `
      : await this.prisma.$queryRaw<{ ts: Date; value: number | null }[]>`
          SELECT
            date_trunc('hour', ts)
            + (INTERVAL '1 minute' * ${bucketMinutes}::int)
            * FLOOR(EXTRACT(MINUTE FROM ts) / ${bucketMinutes}::int) AS ts,
            AVG(
              CASE ${metric}
                WHEN 'voltage' THEN (payload->>'voltageV')::float
                WHEN 'current' THEN (payload->>'currentA')::float
                WHEN 'temperature' THEN (payload->>'temperatureC')::float
              END
            ) AS value
          FROM telemetry_readings
          WHERE
            machine_id = ${machineId}::uuid
            AND ts >= ${fromDate}
            AND ts <= ${toDate}
          GROUP BY 1
          ORDER BY 1 ASC
        `;

    const bucketedData = result.map((item) => ({
      ts: item.ts.toISOString(),
      value: item.value === null ? null : Number(item.value),
    }));

    if (fill === FillType.NONE) {
      return {
        data: bucketedData,
        total: bucketedData.length,
        bucket,
        fill,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      };
    }

    const filledData = this.fillGaps(bucketedData, fromDate, toDate, bucketMinutes, fill);

    return {
      data: filledData,
      total: filledData.length,
      bucket,
      fill,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }

  private fillGaps(
    data: { ts: string; value: number | null }[],
    fromDate: Date,
    toDate: Date,
    bucketMinutes: number,
    fill: FillType,
  ): { ts: string; value: number | null }[] {
    const dataMap = new Map<string, number | null>();
    for (const point of data) dataMap.set(point.ts, point.value);

    const result: { ts: string; value: number | null }[] = [];
    const bucketMs = bucketMinutes * 60 * 1000;

    const startTime = Math.floor(fromDate.getTime() / bucketMs) * bucketMs;
    const endTime = toDate.getTime();

    for (let time = startTime; time <= endTime; time += bucketMs) {
      const ts = new Date(time).toISOString();
      const value = dataMap.get(ts) ?? (fill === FillType.ZERO ? 0 : null);
      result.push({ ts, value });
    }

    return result;
  }

  async findMultiSeries(
    query: TelemetryMultiSeriesQueryDto,
  ): Promise<{
    data: TelemetryMultiSeriesPointDto[];
    total: number;
    bucket?: string;
    fill?: string;
    from?: string;
    to?: string;
  }> {
    const {
      machineId,
      from,
      to,
      bucket,
      fill = FillType.NONE,
      metrics = 'voltage,current,temperature',
    } = query;

    if (!machineId) throw new Error('Machine ID is required for series data');

    const fromDate = from
      ? new Date(from)
      : new Date(new Date().getTime() - 24 * 60 * 60 * 1000); // Default to 24h ago
    const toDate = to ? new Date(to) : new Date(); // Default to now

    const requestedMetrics = metrics.split(',').map((m) => m.trim()) as Metric[];
    if (requestedMetrics.some((m) => !['voltage', 'current', 'temperature'].includes(m))) {
      throw new Error('Invalid metric requested');
    }

    // Without bucket: raw points
    if (!bucket) {
      const readings = await this.prisma.telemetry_readings.findMany({
        where: {
          machine_id: machineId,
          ts: {
            gte: fromDate,
            lte: toDate,
          },
        },
        orderBy: { ts: 'asc' },
      });

      const data = readings.map((r) => {
        const payload = toTelemetryPayload(r.payload);
        const values: TelemetryMultiSeriesValuesDto = {};

        if (requestedMetrics.includes('voltage')) values.voltageV = payload.voltageV;
        if (requestedMetrics.includes('current')) values.currentA = payload.currentA;
        if (requestedMetrics.includes('temperature')) values.temperatureC = payload.temperatureC;

        return {
          ts: r.ts.toISOString(),
          values,
        };
      });

      return {
        data,
        total: data.length,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      };
    }

    // With bucket: aggregate via SQL (REFATORADO + FIX uuid=text)
    const bucketMinutes = this.parseBucketMinutes(bucket);
    if (!bucketMinutes) throw new Error('Invalid bucket format');

    type MultiAggRow = {
      ts: Date;
      voltageV: number | null;
      currentA: number | null;
      temperatureC: number | null;
    };

    const result = await this.prisma.$queryRaw<MultiAggRow[]>`
      SELECT
        date_trunc('hour', ts)
        + (INTERVAL '1 minute' * ${bucketMinutes}::int)
        * FLOOR(EXTRACT(MINUTE FROM ts) / ${bucketMinutes}::int) AS ts,
        AVG((payload->>'voltageV')::float) AS "voltageV",
        AVG((payload->>'currentA')::float) AS "currentA",
        AVG((payload->>'temperatureC')::float) AS "temperatureC"
      FROM telemetry_readings
      WHERE
        machine_id = ${machineId}::uuid
        AND ts >= ${fromDate}
        AND ts <= ${toDate}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const bucketedData = result.map((item) => {
      const values: TelemetryMultiSeriesValuesDto = {};

      if (requestedMetrics.includes('voltage')) values.voltageV = item.voltageV === null ? null : Number(item.voltageV);
      if (requestedMetrics.includes('current')) values.currentA = item.currentA === null ? null : Number(item.currentA);
      if (requestedMetrics.includes('temperature')) values.temperatureC = item.temperatureC === null ? null : Number(item.temperatureC);

      return {
        ts: item.ts.toISOString(),
        values,
      };
    });

    if (fill === FillType.NONE) {
      return {
        data: bucketedData,
        total: bucketedData.length,
        bucket,
        fill,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      };
    }

    const filledData = this.fillMultiSeriesGaps(bucketedData, fromDate, toDate, bucketMinutes, fill, requestedMetrics);

    return {
      data: filledData,
      total: filledData.length,
      bucket,
      fill,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }

  private fillMultiSeriesGaps(
    data: TelemetryMultiSeriesPointDto[],
    fromDate: Date,
    toDate: Date,
    bucketMinutes: number,
    fill: FillType,
    requestedMetrics: Metric[],
  ): TelemetryMultiSeriesPointDto[] {
    const dataMap = new Map<string, TelemetryMultiSeriesValuesDto>();
    for (const point of data) dataMap.set(point.ts, point.values);

    const result: TelemetryMultiSeriesPointDto[] = [];
    const bucketMs = bucketMinutes * 60 * 1000;

    const startTime = Math.floor(fromDate.getTime() / bucketMs) * bucketMs;
    const endTime = toDate.getTime();

    for (let time = startTime; time <= endTime; time += bucketMs) {
      const ts = new Date(time).toISOString();
      const existingValues = dataMap.get(ts);

      if (existingValues) {
        result.push({ ts, values: existingValues });
      } else {
        const values: TelemetryMultiSeriesValuesDto = {};
        const fillValue = fill === FillType.ZERO ? 0 : null;

        if (requestedMetrics.includes('voltage')) values.voltageV = fillValue;
        if (requestedMetrics.includes('current')) values.currentA = fillValue;
        if (requestedMetrics.includes('temperature')) values.temperatureC = fillValue;

        result.push({ ts, values });
      }
    }

    return result;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.telemetry_readings.delete({
      where: { id: this.toBigIntId(id) },
    });
  }

  // ---------- helpers ----------

  private mapTelemetryReading(reading: {
    id: bigint;
    machine_id: string;
    ts: Date;
    payload: JsonValue | null;
  }): TelemetryReadingDto {
    const payload = toTelemetryPayload(reading.payload);

    return {
      id: reading.id.toString(),
      machineId: reading.machine_id,
      ts: reading.ts.toISOString(),
      voltageV: payload.voltageV ?? null,
      currentA: payload.currentA ?? null,
      temperatureC: payload.temperatureC ?? null,
      seq: payload.seq ?? null,
    } as unknown as TelemetryReadingDto;
  }

  private buildTsWhere(from?: string, to?: string): TelemetryWhere {
    if (!from && !to) return {};

    return {
      ts: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    };
  }

  private toBigIntId(id: string): bigint {
    const s = String(id).trim();
    if (!/^\d+$/.test(s)) throw new Error(`Invalid telemetry reading id: "${id}"`);
    return BigInt(s);
  }

  private getMetricKey(metric: Metric): keyof TelemetryPayload {
    switch (metric) {
      case 'voltage':
        return 'voltageV';
      case 'current':
        return 'currentA';
      case 'temperature':
        return 'temperatureC';
    }
  }

  private parseBucketMinutes(bucket: string): number | null {
    switch (bucket) {
      case BucketSize.ONE_MINUTE:
        return 1;
      case BucketSize.FIVE_MINUTES:
        return 5;
      case BucketSize.FIFTEEN_MINUTES:
        return 15;
      case BucketSize.THIRTY_MINUTES:
        return 30;
      case BucketSize.ONE_HOUR:
        return 60;
      case BucketSize.SIX_HOURS:
        return 360;
      case BucketSize.ONE_DAY:
        return 1440;
      default: {
        const match = bucket.match(/^(\d+)([mhd])$/);
        if (!match) return null;

        const num = Number(match[1]);
        const unit = match[2];

        if (!Number.isFinite(num) || num <= 0) return null;

        if (unit === 'm') return num;
        if (unit === 'h') return num * 60;
        if (unit === 'd') return num * 24 * 60;

        return null;
      }
    }
  }
}
