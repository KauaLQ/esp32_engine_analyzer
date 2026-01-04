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
exports.EmissionsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const emissions_query_dto_1 = require("../domain/dto/emissions-query.dto");
let EmissionsRepository = class EmissionsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findTelemetryReadingById(id) {
        const reading = await this.prisma.telemetry_readings.findUnique({
            where: { id: typeof id === 'string' ? BigInt(id) : id },
        });
        if (!reading)
            return null;
        const payload = reading.payload;
        return {
            id: reading.id.toString(),
            machineId: reading.machine_id,
            ts: reading.ts.toISOString(),
            voltageV: payload?.voltageV,
            currentA: payload?.currentA,
            payload,
        };
    }
    async findPreviousTelemetryReading(machineId, currentTs) {
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
        if (!reading)
            return null;
        const payload = reading.payload;
        return {
            id: reading.id.toString(),
            machineId: reading.machine_id,
            ts: reading.ts.toISOString(),
            voltageV: payload?.voltageV,
            currentA: payload?.currentA,
            payload,
        };
    }
    async findEmissionFactor(machineId) {
        let factor = await this.prisma.emission_factors.findFirst({
            where: {
                machine_id: machineId,
                name: 'default',
            },
        });
        if (!factor) {
            factor = await this.prisma.emission_factors.findFirst({
                where: {
                    machine_id: machineId,
                },
            });
        }
        return factor;
    }
    async updateTelemetryReadingPayload(id, computed) {
        const reading = await this.prisma.telemetry_readings.findUnique({
            where: { id: typeof id === 'string' ? BigInt(id) : id },
            select: { payload: true },
        });
        if (!reading)
            return;
        const payload = reading.payload;
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
    async getSummary(machineId, from, to) {
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
        for (const reading of readings) {
            const payload = reading.payload;
            const computed = payload?.computed;
            if (computed?.energy_kwh_increment) {
                energyKwhTotal += Number(computed.energy_kwh_increment);
            }
            if (computed?.kgco2e_increment) {
                kgco2eTotal += Number(computed.kgco2e_increment);
            }
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
    async getSeries(machineId, from, to, bucket, metric) {
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
        if (readings.length < 2) {
            return {
                points: readings.map(reading => {
                    const payload = reading.payload;
                    const computed = payload?.computed;
                    return {
                        ts: reading.ts.toISOString(),
                        value: this.getMetricValue(computed, metric),
                    };
                }),
            };
        }
        const bucketMillis = this.getBucketMilliseconds(bucket);
        const buckets = {};
        for (const reading of readings) {
            const payload = reading.payload;
            const computed = payload?.computed;
            if (!computed)
                continue;
            const readingTime = reading.ts.getTime();
            const bucketTime = Math.floor(readingTime / bucketMillis) * bucketMillis;
            const bucketTs = new Date(bucketTime).toISOString();
            const value = this.getMetricValue(computed, metric);
            if (!buckets[bucketTs]) {
                buckets[bucketTs] = { sum: 0, count: 0 };
            }
            if (metric === emissions_query_dto_1.EmissionMetric.POWER_KW) {
                buckets[bucketTs].sum += value;
                buckets[bucketTs].count += 1;
            }
            else {
                if ((metric === emissions_query_dto_1.EmissionMetric.ENERGY_KWH && computed.energy_kwh_increment) ||
                    (metric === emissions_query_dto_1.EmissionMetric.KGCO2E && computed.kgco2e_increment)) {
                    buckets[bucketTs].sum += value;
                    buckets[bucketTs].count = 1;
                }
            }
        }
        const points = Object.entries(buckets).map(([ts, { sum, count }]) => ({
            ts,
            value: metric === emissions_query_dto_1.EmissionMetric.POWER_KW ? (sum / count) : sum,
        }));
        points.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        return { points };
    }
    getMetricValue(computed, metric) {
        switch (metric) {
            case emissions_query_dto_1.EmissionMetric.POWER_KW:
                return Number(computed?.power_kw || 0);
            case emissions_query_dto_1.EmissionMetric.ENERGY_KWH:
                return Number(computed?.energy_kwh_increment || 0);
            case emissions_query_dto_1.EmissionMetric.KGCO2E:
                return Number(computed?.kgco2e_increment || 0);
            default:
                return 0;
        }
    }
    getBucketMilliseconds(bucket) {
        switch (bucket) {
            case emissions_query_dto_1.BucketInterval.FIVE_MINUTES:
                return 5 * 60 * 1000;
            case emissions_query_dto_1.BucketInterval.FIFTEEN_MINUTES:
                return 15 * 60 * 1000;
            case emissions_query_dto_1.BucketInterval.ONE_HOUR:
                return 60 * 60 * 1000;
            case emissions_query_dto_1.BucketInterval.ONE_DAY:
                return 24 * 60 * 60 * 1000;
            default:
                return 60 * 60 * 1000;
        }
    }
};
exports.EmissionsRepository = EmissionsRepository;
exports.EmissionsRepository = EmissionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmissionsRepository);
//# sourceMappingURL=emissions.repository.js.map