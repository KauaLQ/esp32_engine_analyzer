import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

type AlarmsWhere = Record<string, any>;
type DateRange = { from?: Date; to?: Date };

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  // -----------------------------
  // Helpers
  // -----------------------------
  private buildOpenedAtWhere(range?: DateRange): AlarmsWhere {
    const where: AlarmsWhere = {};

    if (range?.from || range?.to) {
      where.opened_at = {};
      if (range.from) where.opened_at.gte = range.from;
      if (range.to) where.opened_at.lte = range.to;
    }

    return where;
  }

  private mapGroupByCounts<
    K extends 'status' | 'severity',
    T extends { _count: Record<K, number> } & Record<K, string>
  >(rows: T[], key: K) {
    return rows.map((r) => ({
      [key]: r[key],
      count: r._count[key],
    })) as Array<Record<K, string> & { count: number }>;
  }

  // -----------------------------
  // Basic counts
  // -----------------------------
  async countMachines(): Promise<number> {
    return this.prisma.machines.count();
  }

  async countPatios(): Promise<number> {
    return this.prisma.patios.count();
  }

  // -----------------------------
  // Alarms aggregation
  // -----------------------------
  async countAlarmsByStatus(
    from?: Date,
    to?: Date,
  ): Promise<{ status: string; count: number }[]> {
    const where = this.buildOpenedAtWhere({ from, to });

    const results = await this.prisma.alarms.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    return this.mapGroupByCounts(results as any, 'status') as {
      status: string;
      count: number;
    }[];
  }

  async countAlarmsBySeverity(
    from?: Date,
    to?: Date,
  ): Promise<{ severity: string; count: number }[]> {
    const where = this.buildOpenedAtWhere({ from, to });

    const results = await this.prisma.alarms.groupBy({
      by: ['severity'],
      where,
      _count: { severity: true },
    });

    return this.mapGroupByCounts(results as any, 'severity') as {
      severity: string;
      count: number;
    }[];
  }

  async countOpenAlarmsBySeverity(
    from?: Date,
    to?: Date,
  ): Promise<{ severity: string; count: number }[]> {
    const where: AlarmsWhere = {
      status: 'open',
      ...this.buildOpenedAtWhere({ from, to }),
    };

    const results = await this.prisma.alarms.groupBy({
      by: ['severity'],
      where,
      _count: { severity: true },
    });

    return this.mapGroupByCounts(results as any, 'severity') as {
      severity: string;
      count: number;
    }[];
  }

  // -----------------------------
  // Telemetry averages (RAW SQL)
  // -----------------------------
  async getAverageTelemetryValues(
    from: Date,
    to: Date,
  ): Promise<{
    avgVoltageV: number | null;
    avgCurrentA: number | null;
    avgTemperatureC: number | null;
    avgPowerKw: number | null;
    avgEnergyKwh: number | null;
    avgKgco2e: number | null;
    machinesCount: number;
    pointsCount: number;
  }> {
    // 1) Collect machine ids (uuid strings)
    const machines = await this.prisma.machines.findMany({
      select: { id: true },
    });

    const machineIds = machines.map((m) => m.id);

    if (machineIds.length === 0) {
      return {
        avgVoltageV: null,
        avgCurrentA: null,
        avgTemperatureC: null,
        avgPowerKw: null,
        avgEnergyKwh: null,
        avgKgco2e: null,
        machinesCount: 0,
        pointsCount: 0,
      };
    }

    const basic = await this.prisma.$queryRaw<{
      avg_voltage: number | null;
      avg_current: number | null;
      avg_temperature: number | null;
      points_count: bigint | number;
    }[]>`
      SELECT
        AVG((payload->>'voltageV')::float)      AS avg_voltage,
        AVG((payload->>'currentA')::float)      AS avg_current,
        AVG((payload->>'temperatureC')::float)  AS avg_temperature,
        COUNT(*)                                AS points_count
      FROM telemetry_readings
      WHERE ts >= ${from}
        AND ts <= ${to}
        AND machine_id = ANY(${machineIds}::uuid[])
    `;

    const emissions = await this.prisma.$queryRaw<{
      avg_power: number | null;
      avg_energy: number | null;
      avg_kgco2e: number | null;
      emissions_points_count: bigint | number;
    }[]>`
      SELECT
        AVG((payload->'computed'->>'power_kw')::float)                 AS avg_power,
        AVG((payload->'computed'->>'energy_kwh_increment')::float)     AS avg_energy,
        AVG((payload->'computed'->>'kgco2e_increment')::float)         AS avg_kgco2e,
        COUNT(*) FILTER (WHERE payload->'computed'->>'power_kw' IS NOT NULL) AS emissions_points_count
      FROM telemetry_readings
      WHERE ts >= ${from}
        AND ts <= ${to}
        AND machine_id = ANY(${machineIds}::uuid[])
        AND payload ? 'computed'
    `;

    const basicRow = basic?.[0] ?? {
      avg_voltage: null,
      avg_current: null,
      avg_temperature: null,
      points_count: 0,
    };

    const emissionsRow = emissions?.[0] ?? {
      avg_power: null,
      avg_energy: null,
      avg_kgco2e: null,
      emissions_points_count: 0,
    };

    const pointsCount = Number(basicRow.points_count ?? 0);

    return {
      avgVoltageV: basicRow.avg_voltage !== null ? Number(basicRow.avg_voltage) : null,
      avgCurrentA: basicRow.avg_current !== null ? Number(basicRow.avg_current) : null,
      avgTemperatureC:
        basicRow.avg_temperature !== null ? Number(basicRow.avg_temperature) : null,

      avgPowerKw: emissionsRow.avg_power !== null ? Number(emissionsRow.avg_power) : null,
      avgEnergyKwh: emissionsRow.avg_energy !== null ? Number(emissionsRow.avg_energy) : null,
      avgKgco2e: emissionsRow.avg_kgco2e !== null ? Number(emissionsRow.avg_kgco2e) : null,

      machinesCount: machineIds.length,
      pointsCount: Number.isFinite(pointsCount) ? pointsCount : 0,
    };
  }
}
