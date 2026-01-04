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
exports.MachinesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const machine_query_dto_1 = require("../domain/dto/machine-query.dto");
let MachinesRepository = class MachinesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toJsonObject(meta) {
        if (!meta)
            return undefined;
        return meta;
    }
    mergeMetadata(existingMeta, newMeta) {
        const existing = existingMeta && typeof existingMeta === 'object' && !Array.isArray(existingMeta)
            ? existingMeta
            : {};
        return { ...existing, ...newMeta };
    }
    toDeviceDto(d) {
        return {
            id: d.id,
            deviceId: d.device_id,
            fwVersion: d.fw_version,
            lastSeenAt: d.last_seen_at,
            pairedAt: d.paired_at,
        };
    }
    toMachineDto(m) {
        const first = m.devices?.[0];
        return {
            id: m.id,
            machineKey: m.machine_key,
            patioId: m.patio_id,
            manufacturer: m.manufacturer,
            model: m.model,
            status: m.status,
            operatorUserId: m.operator_user_id,
            meta: (m.meta ?? {}),
            createdAt: m.created_at,
            updatedAt: m.updated_at,
            device: first ? this.toDeviceDto(first) : undefined,
            lastSeenAt: first?.last_seen_at ?? null,
        };
    }
    async provision(dto) {
        const existingDevice = await this.prisma.devices.findUnique({
            where: { device_id: dto.deviceId },
            select: { paired_at: true, machine_id: true },
        });
        if (existingDevice?.machine_id) {
            const machineOfDevice = await this.prisma.machines.findUnique({
                where: { id: existingDevice.machine_id },
                select: { machine_key: true },
            });
            if (machineOfDevice && machineOfDevice.machine_key !== dto.machineKey) {
                throw new Error(`Device ${dto.deviceId} is already paired with machine ${machineOfDevice.machine_key}`);
            }
        }
        const existingMachine = await this.prisma.machines.findUnique({
            where: { machine_key: dto.machineKey },
            include: { devices: { select: { device_id: true } } },
        });
        const deviceOnMachine = existingMachine?.devices?.[0];
        if (deviceOnMachine && deviceOnMachine.device_id !== dto.deviceId) {
            throw new Error(`Machine ${dto.machineKey} is already paired with device ${deviceOnMachine.device_id}`);
        }
        const machine = await this.prisma.machines.upsert({
            where: { machine_key: dto.machineKey },
            create: {
                machine_key: dto.machineKey,
                manufacturer: dto.manufacturer || '',
                model: dto.model || '',
                status: dto.status || 'operante',
                meta: this.toJsonObject(dto.meta) ?? {},
            },
            update: {
                manufacturer: dto.manufacturer ?? undefined,
                model: dto.model ?? undefined,
                status: dto.status ?? undefined,
                meta: dto.meta
                    ? this.mergeMetadata(existingMachine?.meta, dto.meta)
                    : undefined,
            },
        });
        const device = await this.prisma.devices.upsert({
            where: { device_id: dto.deviceId },
            create: {
                device_id: dto.deviceId,
                machine_id: machine.id,
                fw_version: dto.fwVersion ?? null,
                last_seen_at: new Date(),
                paired_at: new Date(),
            },
            update: {
                machine_id: machine.id,
                fw_version: dto.fwVersion ?? undefined,
                last_seen_at: new Date(),
                paired_at: existingDevice?.paired_at ?? new Date(),
            },
        });
        return { machine, device };
    }
    async findAll(query) {
        const { search, status, patioId, limit = 50, order = machine_query_dto_1.OrderDirection.DESC, orderBy = machine_query_dto_1.OrderField.UPDATED_AT, } = query;
        const where = {};
        if (search) {
            where.OR = [
                { machine_key: { contains: search, mode: 'insensitive' } },
                { meta: { path: ['tag'], string_contains: search } },
            ];
        }
        if (status)
            where.status = status;
        if (patioId)
            where.patio_id = patioId;
        const orderByMap = {
            [machine_query_dto_1.OrderField.CREATED_AT]: 'created_at',
            [machine_query_dto_1.OrderField.UPDATED_AT]: 'updated_at',
        };
        const prismaOrderBy = orderByMap[orderBy];
        const prismaOrder = order;
        const [data, total] = await Promise.all([
            this.prisma.machines.findMany({
                where,
                include: {
                    devices: {
                        select: {
                            id: true,
                            device_id: true,
                            fw_version: true,
                            last_seen_at: true,
                            paired_at: true,
                        },
                    },
                },
                orderBy: { [prismaOrderBy]: prismaOrder },
                take: limit,
            }),
            this.prisma.machines.count({ where }),
        ]);
        const mappedData = data.map((m) => this.toMachineDto(m));
        return {
            data: mappedData,
            total,
            limit,
            hasMore: total > limit,
        };
    }
    async findOne(id) {
        const machine = await this.prisma.machines.findUnique({
            where: { id },
            include: {
                devices: {
                    select: {
                        id: true,
                        device_id: true,
                        fw_version: true,
                        last_seen_at: true,
                        paired_at: true,
                    },
                },
            },
        });
        if (!machine)
            return null;
        return this.toMachineDto(machine);
    }
    async update(id, dto) {
        const existingMachine = await this.prisma.machines.findUnique({
            where: { id },
            select: { meta: true },
        });
        if (!existingMachine)
            return null;
        const updated = await this.prisma.machines.update({
            where: { id },
            data: {
                status: dto.status ?? undefined,
                manufacturer: dto.manufacturer ?? undefined,
                model: dto.model ?? undefined,
                patio_id: dto.patioId ?? undefined,
                operator_user_id: dto.operatorUserId ?? undefined,
                meta: dto.meta ? this.mergeMetadata(existingMachine.meta, dto.meta) : undefined,
            },
            include: {
                devices: {
                    select: {
                        id: true,
                        device_id: true,
                        fw_version: true,
                        last_seen_at: true,
                        paired_at: true,
                    },
                },
            },
        });
        return this.toMachineDto(updated);
    }
    async updateDeviceLastSeen(machineId) {
        await this.prisma.devices.updateMany({
            where: { machine_id: machineId },
            data: { last_seen_at: new Date() },
        });
    }
    async delete(id) {
        const machine = await this.prisma.machines.findUnique({
            where: { id },
            include: {
                devices: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!machine)
            return false;
        if (machine.devices && machine.devices.length > 0) {
            await this.prisma.devices.updateMany({
                where: { machine_id: id },
                data: {
                    machine_id: null,
                    status: 'provisioning',
                    paired_at: null,
                },
            });
        }
        await this.prisma.machines.delete({
            where: { id },
        });
        return true;
    }
};
exports.MachinesRepository = MachinesRepository;
exports.MachinesRepository = MachinesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachinesRepository);
//# sourceMappingURL=machines.repository.js.map