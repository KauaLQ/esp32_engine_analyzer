"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let DashboardRepository = class DashboardRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildOpenedAtWhere(range) {
        const where = {};
        if (range?.from || range?.to) {
            where.opened_at = {};
            if (range.from)
                where.opened_at.gte = range.from;
            if (range.to)
                where.opened_at.lte = range.to;
        }
        return where;
    }
    mapGroupByCounts(rows, key) {
        return rows.map((r) => ({
            [key]: r[key],
            count: r._count[key],
        }));
    }
    async countMachines() {
        return this.prisma.machines.count();
    }
    async countPatios() {
        return this.prisma.patios.count();
    }
    async countAlarmsByStatus(from, to) {
        const where = this.buildOpenedAtWhere({ from, to });
        const results = await this.prisma.alarms.groupBy({
            by: ['status'],
            where,
            _count: { status: true },
        });
        return this.mapGroupByCounts(results, 'status');
    }
    async countAlarmsBySeverity(from, to) {
        const where = this.buildOpenedAtWhere({ from, to });
        const results = await this.prisma.alarms.groupBy({
            by: ['severity'],
            where,
            _count: { severity: true },
        });
        return this.mapGroupByCounts(results, 'severity');
    }
    async countOpenAlarmsBySeverity(from, to) {
        const where = {
            status: 'open',
            ...this.buildOpenedAtWhere({ from, to }),
        };
        const results = await this.prisma.alarms.groupBy({
            by: ['severity'],
            where,
            _count: { severity: true },
        });
        return this.mapGroupByCounts(results, 'severity');
    }
    async getAverageTelemetryValues(from, to) {
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
        const basic = await this.prisma.$queryRaw `
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
        const emissions = await this.prisma.$queryRaw `
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
            avgTemperatureC: basicRow.avg_temperature !== null ? Number(basicRow.avg_temperature) : null,
            avgPowerKw: emissionsRow.avg_power !== null ? Number(emissionsRow.avg_power) : null,
            avgEnergyKwh: emissionsRow.avg_energy !== null ? Number(emissionsRow.avg_energy) : null,
            avgKgco2e: emissionsRow.avg_kgco2e !== null ? Number(emissionsRow.avg_kgco2e) : null,
            machinesCount: machineIds.length,
            pointsCount: Number.isFinite(pointsCount) ? pointsCount : 0,
        };
    }
};
exports.DashboardRepository = DashboardRepository;
exports.DashboardRepository = DashboardRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardRepository);
//# sourceMappingURL=dashboard.repository.js.map