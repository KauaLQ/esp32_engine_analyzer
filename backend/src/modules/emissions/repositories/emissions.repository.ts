import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmissionMetric, BucketInterval } from '../domain/dto/emissions-query.dto';
import { EmissionsSeriesPointDto } from '../domain/dto/emissions-response.dto';

@Injectable()
export class EmissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTelemetryReadingById(id: string | number): Promise<any> {
    const reading = await this.prisma.telemetry_readings.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : id },
    });

    if (!reading) return null;

    // Extract values from payload
    const payload = reading.payload as any;
    return {
      id: reading.id.toString(),
      machineId: reading.machine_id,
      ts: reading.ts.toISOString(),
      voltageV: payload?.voltageV,
      currentA: payload?.currentA,
      payload,
    };
  }

  async findPreviousTelemetryReading(machineId: string, currentTs: string): Promise<any> {
    const reading = await this.prisma.telemetry_readings.findFirst({
      where: {
        machine_id: machineId,
        ts: {
          lt: new Date(currentTs),
        },
      },
      orderBy: {
        ts: 'desc',
      },
    });

    if (!reading) return null;

    // Extract values from payload
    const payload = reading.payload as any;
    return {
      id: reading.id.toString(),
      machineId: reading.machine_id,
      ts: reading.ts.toISOString(),
      voltageV: payload?.voltageV,
      currentA: payload?.currentA,
      payload,
    };
  }

  async findEmissionFactor(machineId: string): Promise<any> {
    // Try to find a factor with name 'default' first
    let factor = await this.prisma.emission_factors.findFirst({
      where: {
        machine_id: machineId,
        name: 'default',
      },
    });

    // If not found, get the first factor for this machine
    if (!factor) {
      factor = await this.prisma.emission_factors.findFirst({
        where: {
          machine_id: machineId,
        },
      });
    }

    return factor;
  }

  async updateTelemetryReadingPayload(id: string | number, computed: any): Promise<void> {
    const reading = await this.prisma.telemetry_readings.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : id },
      select: { payload: true },
    });

    if (!reading) return;

    // Merge existing payload with computed values
    const payload = reading.payload as any;
    const updatedPayload = {
      ...payload,
      computed: {
        ...payload?.computed,
        ...computed,
      },
    };

    await this.prisma.telemetry_readings.update({
      where: { id: typeof id === 'string' ? BigInt(id) : id },
      data: { payload: updatedPayload },
    });
  }

  async getSummary(machineId: string, from: string, to: string): Promise<any> {
    const readings = await this.prisma.telemetry_readings.findMany({
      where: {
        machine_id: machineId,
        ts: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: {
        ts: 'asc',
      },
    });

    let energyKwhTotal = 0;
    let kgco2eTotal = 0;
    let factorUsed = 0;

    // Sum up energy and emissions from computed values
    for (const reading of readings) {
      const payload = reading.payload as any;
      const computed = payload?.computed;
      
      if (computed?.energy_kwh_increment) {
        energyKwhTotal += Number(computed.energy_kwh_increment);
      }
      
      if (computed?.kgco2e_increment) {
        kgco2eTotal += Number(computed.kgco2e_increment);
      }
      
      // Capture the emission factor used (should be the same for all readings)
      if (factorUsed === null && computed?.emission_factor_used !== undefined) {
        factorUsed = Number(computed.emission_factor_used);
      }
    }

    return {
      energyKwhTotal,
      kgco2eTotal,
      factorUsed,
      pointsCount: readings.length,
    };
  }

  async getSeries(
    machineId: string,
    from: string,
    to: string,
    bucket: BucketInterval,
    metric: EmissionMetric,
  ): Promise<{ points: EmissionsSeriesPointDto[] }> {
    const readings = await this.prisma.telemetry_readings.findMany({
      where: {
        machine_id: machineId,
        ts: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: {
        ts: 'asc',
      },
    });

    // If no bucket specified or not enough data, return raw points
    if (readings.length < 2) {
      return {
        points: readings.map(reading => {
          const payload = reading.payload as any;
          const computed = payload?.computed;
          return {
            ts: reading.ts.toISOString(),
            value: this.getMetricValue(computed, metric),
          };
        }),
      };
    }

    // Group readings by bucket
    const bucketMillis = this.getBucketMilliseconds(bucket);
    const buckets: Record<string, { sum: number; count: number }> = {};

    for (const reading of readings) {
      const payload = reading.payload as any;
      const computed = payload?.computed;
      
      if (!computed) continue;
      
      // Calculate bucket timestamp (truncate to bucket interval)
      const readingTime = reading.ts.getTime();
      const bucketTime = Math.floor(readingTime / bucketMillis) * bucketMillis;
      const bucketTs = new Date(bucketTime).toISOString();
      
      // Get metric value
      const value = this.getMetricValue(computed, metric);
      
      // Add to bucket
      if (!buckets[bucketTs]) {
        buckets[bucketTs] = { sum: 0, count: 0 };
      }
      
      // For power_kw, we average; for energy and emissions, we sum
      if (metric === EmissionMetric.POWER_KW) {
        buckets[bucketTs].sum += value;
        buckets[bucketTs].count += 1;
      } else {
        // For energy and emissions, only add increment values
        if (
          (metric === EmissionMetric.ENERGY_KWH && computed.energy_kwh_increment) ||
          (metric === EmissionMetric.KGCO2E && computed.kgco2e_increment)
        ) {
          buckets[bucketTs].sum += value;
          buckets[bucketTs].count = 1; // We don't average these
        }
      }
    }

    // Convert buckets to points
    const points = Object.entries(buckets).map(([ts, { sum, count }]) => ({
      ts,
      value: metric === EmissionMetric.POWER_KW ? (sum / count) : sum,
    }));

    // Sort by timestamp
    points.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    return { points };
  }

  private getMetricValue(computed: any, metric: EmissionMetric): number {
    switch (metric) {
      case EmissionMetric.POWER_KW:
        return Number(computed?.power_kw || 0);
      case EmissionMetric.ENERGY_KWH:
        return Number(computed?.energy_kwh_increment || 0);
      case EmissionMetric.KGCO2E:
        return Number(computed?.kgco2e_increment || 0);
      default:
        return 0;
    }
  }

  private getBucketMilliseconds(bucket: BucketInterval): number {
    switch (bucket) {
      case BucketInterval.FIVE_MINUTES:
        return 5 * 60 * 1000;
      case BucketInterval.FIFTEEN_MINUTES:
        return 15 * 60 * 1000;
      case BucketInterval.ONE_HOUR:
        return 60 * 60 * 1000;
      case BucketInterval.ONE_DAY:
        return 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000; // Default to 1 hour
    }
  }
}
