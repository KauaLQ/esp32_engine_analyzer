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
exports.AlarmsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AlarmsRepository = class AlarmsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, userId) {
        const { machineId, type = 'manual', severity, title, details = {}, dedupeKey } = createDto;
        const alarm = await this.prisma.alarms.create({
            data: {
                machine_id: machineId,
                type,
                severity: severity,
                status: 'open',
                title,
                details,
                dedupe_key: dedupeKey,
                opened_at: new Date(),
                last_seen_at: new Date(),
            },
        });
        return this.mapToAlarmDto(alarm);
    }
    async findAll(query) {
        const { machineId, status, severity, from, to, limit = 50 } = query;
        const where = {};
        if (machineId)
            where.machine_id = machineId;
        if (status)
            where.status = status;
        if (severity)
            where.severity = severity;
        if (from || to) {
            where.opened_at = {};
            if (from)
                where.opened_at.gte = new Date(from);
            if (to)
                where.opened_at.lte = new Date(to);
        }
        const [data, total] = await Promise.all([
            this.prisma.alarms.findMany({
                where,
                orderBy: { opened_at: 'desc' },
                take: limit,
            }),
            this.prisma.alarms.count({ where }),
        ]);
        return {
            data: data.map(this.mapToAlarmDto),
            total,
            limit,
            hasMore: total > limit,
        };
    }
    async findById(id) {
        const alarm = await this.prisma.alarms.findUnique({
            where: { id },
        });
        return alarm ? this.mapToAlarmDto(alarm) : null;
    }
    async findByDedupeKey(machineId, dedupeKey, status) {
        const alarm = await this.prisma.alarms.findFirst({
            where: {
                machine_id: machineId,
                dedupe_key: dedupeKey,
                status: status,
            },
        });
        return alarm ? this.mapToAlarmDto(alarm) : null;
    }
    async updateLastSeen(id) {
        const alarm = await this.prisma.alarms.update({
            where: { id },
            data: {
                last_seen_at: new Date(),
            },
        });
        return this.mapToAlarmDto(alarm);
    }
    async updateSeverity(id, severity) {
        const alarm = await this.prisma.alarms.update({
            where: { id },
            data: {
                severity: severity,
            },
        });
        return this.mapToAlarmDto(alarm);
    }
    async updateDetails(id, title, details) {
        const alarm = await this.prisma.alarms.update({
            where: { id },
            data: {
                title,
                details,
            },
        });
        return this.mapToAlarmDto(alarm);
    }
    async acknowledge(id, userId) {
        const alarm = await this.prisma.alarms.update({
            where: { id },
            data: {
                status: 'ack',
                ack_at: new Date(),
                ack_by: userId,
            },
        });
        return this.mapToAlarmDto(alarm);
    }
    async close(id, userId) {
        const alarm = await this.prisma.alarms.update({
            where: { id },
            data: {
                status: 'closed',
                closed_at: new Date(),
                closed_by: userId,
            },
        });
        return this.mapToAlarmDto(alarm);
    }
    async delete(id) {
        await this.prisma.alarms.delete({
            where: { id },
        });
    }
    mapToAlarmDto(alarm) {
        return {
            id: alarm.id,
            machineId: alarm.machine_id,
            type: alarm.type,
            severity: alarm.severity,
            status: alarm.status,
            title: alarm.title,
            details: alarm.details,
            openedAt: alarm.opened_at.toISOString(),
            lastSeenAt: alarm.last_seen_at.toISOString(),
            ackAt: alarm.ack_at ? alarm.ack_at.toISOString() : undefined,
            closedAt: alarm.closed_at ? alarm.closed_at.toISOString() : undefined,
            dedupeKey: alarm.dedupe_key,
        };
    }
};
exports.AlarmsRepository = AlarmsRepository;
exports.AlarmsRepository = AlarmsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlarmsRepository);
//# sourceMappingURL=alarms.repository.js.map