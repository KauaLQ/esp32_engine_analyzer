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
exports.TelemetryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const telemetry_query_dto_1 = require("../domain/dto/telemetry-query.dto");
const telemetry_payload_1 = require("./telemetry-payload");
let TelemetryRepository = class TelemetryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTelemetryDto) {
        const { machineId, voltageV, currentA, temperatureC, seq } = createTelemetryDto;
        const reading = await this.prisma.telemetry_readings.create({
            data: {
                machine_id: machineId,
                ts: new Date(),
                payload: { voltageV, currentA, temperatureC, seq },
            },
        });
        return this.mapTelemetryReading(reading);
    }
    async findAll(query) {
        const { machineId, from, to, limit = 100, order = telemetry_query_dto_1.SortOrder.DESC } = query;
        const where = {
            ...(machineId ? { machine_id: machineId } : {}),
            ...this.buildTsWhere(from, to),
        };
        const [data, total] = await Promise.all([
            this.prisma.telemetry_readings.findMany({
                where,
                orderBy: { ts: order === telemetry_query_dto_1.SortOrder.DESC ? 'desc' : 'asc' },
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
    async findLatest(machineId) {
        const reading = await this.prisma.telemetry_readings.findFirst({
            where: { machine_id: machineId },
            orderBy: { ts: 'desc' },
        });
        return reading ? this.mapTelemetryReading(reading) : null;
    }
    async findSeries(metric, query) {
        const { machineId, from, to, bucket, fill = telemetry_query_dto_1.FillType.NONE, limit } = query;
        if (!machineId)
            throw new Error('Machine ID is required for series data');
        const fromDate = from
            ? new Date(from)
            : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();
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
                const payload = (0, telemetry_payload_1.toTelemetryPayload)(r.payload);
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
        const bucketMinutes = this.parseBucketMinutes(bucket);
        if (!bucketMinutes)
            throw new Error('Invalid bucket format');
        const result = limit
            ? await this.prisma.$queryRaw `
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
            : await this.prisma.$queryRaw `
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
        if (fill === telemetry_query_dto_1.FillType.NONE) {
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
    fillGaps(data, fromDate, toDate, bucketMinutes, fill) {
        const dataMap = new Map();
        for (const point of data)
            dataMap.set(point.ts, point.value);
        const result = [];
        const bucketMs = bucketMinutes * 60 * 1000;
        const startTime = Math.floor(fromDate.getTime() / bucketMs) * bucketMs;
        const endTime = toDate.getTime();
        for (let time = startTime; time <= endTime; time += bucketMs) {
            const ts = new Date(time).toISOString();
            const value = dataMap.get(ts) ?? (fill === telemetry_query_dto_1.FillType.ZERO ? 0 : null);
            result.push({ ts, value });
        }
        return result;
    }
    async findMultiSeries(query) {
        const { machineId, from, to, bucket, fill = telemetry_query_dto_1.FillType.NONE, metrics = 'voltage,current,temperature', } = query;
        if (!machineId)
            throw new Error('Machine ID is required for series data');
        const fromDate = from
            ? new Date(from)
            : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();
        const requestedMetrics = metrics.split(',').map((m) => m.trim());
        if (requestedMetrics.some((m) => !['voltage', 'current', 'temperature'].includes(m))) {
            throw new Error('Invalid metric requested');
        }
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
                const payload = (0, telemetry_payload_1.toTelemetryPayload)(r.payload);
                const values = {};
                if (requestedMetrics.includes('voltage'))
                    values.voltageV = payload.voltageV;
                if (requestedMetrics.includes('current'))
                    values.currentA = payload.currentA;
                if (requestedMetrics.includes('temperature'))
                    values.temperatureC = payload.temperatureC;
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
        const bucketMinutes = this.parseBucketMinutes(bucket);
        if (!bucketMinutes)
            throw new Error('Invalid bucket format');
        const result = await this.prisma.$queryRaw `
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
            const values = {};
            if (requestedMetrics.includes('voltage'))
                values.voltageV = item.voltageV === null ? null : Number(item.voltageV);
            if (requestedMetrics.includes('current'))
                values.currentA = item.currentA === null ? null : Number(item.currentA);
            if (requestedMetrics.includes('temperature'))
                values.temperatureC = item.temperatureC === null ? null : Number(item.temperatureC);
            return {
                ts: item.ts.toISOString(),
                values,
            };
        });
        if (fill === telemetry_query_dto_1.FillType.NONE) {
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
    fillMultiSeriesGaps(data, fromDate, toDate, bucketMinutes, fill, requestedMetrics) {
        const dataMap = new Map();
        for (const point of data)
            dataMap.set(point.ts, point.values);
        const result = [];
        const bucketMs = bucketMinutes * 60 * 1000;
        const startTime = Math.floor(fromDate.getTime() / bucketMs) * bucketMs;
        const endTime = toDate.getTime();
        for (let time = startTime; time <= endTime; time += bucketMs) {
            const ts = new Date(time).toISOString();
            const existingValues = dataMap.get(ts);
            if (existingValues) {
                result.push({ ts, values: existingValues });
            }
            else {
                const values = {};
                const fillValue = fill === telemetry_query_dto_1.FillType.ZERO ? 0 : null;
                if (requestedMetrics.includes('voltage'))
                    values.voltageV = fillValue;
                if (requestedMetrics.includes('current'))
                    values.currentA = fillValue;
                if (requestedMetrics.includes('temperature'))
                    values.temperatureC = fillValue;
                result.push({ ts, values });
            }
        }
        return result;
    }
    async delete(id) {
        await this.prisma.telemetry_readings.delete({
            where: { id: this.toBigIntId(id) },
        });
    }
    mapTelemetryReading(reading) {
        const payload = (0, telemetry_payload_1.toTelemetryPayload)(reading.payload);
        return {
            id: reading.id.toString(),
            machineId: reading.machine_id,
            ts: reading.ts.toISOString(),
            voltageV: payload.voltageV ?? null,
            currentA: payload.currentA ?? null,
            temperatureC: payload.temperatureC ?? null,
            seq: payload.seq ?? null,
        };
    }
    buildTsWhere(from, to) {
        if (!from && !to)
            return {};
        return {
            ts: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
            },
        };
    }
    toBigIntId(id) {
        const s = String(id).trim();
        if (!/^\d+$/.test(s))
            throw new Error(`Invalid telemetry reading id: "${id}"`);
        return BigInt(s);
    }
    getMetricKey(metric) {
        switch (metric) {
            case 'voltage':
                return 'voltageV';
            case 'current':
                return 'currentA';
            case 'temperature':
                return 'temperatureC';
        }
    }
    parseBucketMinutes(bucket) {
        switch (bucket) {
            case telemetry_query_dto_1.BucketSize.ONE_MINUTE:
                return 1;
            case telemetry_query_dto_1.BucketSize.FIVE_MINUTES:
                return 5;
            case telemetry_query_dto_1.BucketSize.FIFTEEN_MINUTES:
                return 15;
            case telemetry_query_dto_1.BucketSize.THIRTY_MINUTES:
                return 30;
            case telemetry_query_dto_1.BucketSize.ONE_HOUR:
                return 60;
            case telemetry_query_dto_1.BucketSize.SIX_HOURS:
                return 360;
            case telemetry_query_dto_1.BucketSize.ONE_DAY:
                return 1440;
            default: {
                const match = bucket.match(/^(\d+)([mhd])$/);
                if (!match)
                    return null;
                const num = Number(match[1]);
                const unit = match[2];
                if (!Number.isFinite(num) || num <= 0)
                    return null;
                if (unit === 'm')
                    return num;
                if (unit === 'h')
                    return num * 60;
                if (unit === 'd')
                    return num * 24 * 60;
                return null;
            }
        }
    }
};
exports.TelemetryRepository = TelemetryRepository;
exports.TelemetryRepository = TelemetryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelemetryRepository);
//# sourceMappingURL=telemetry.repository.js.map