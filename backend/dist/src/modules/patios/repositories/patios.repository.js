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
exports.PatiosRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let PatiosRepository = class PatiosRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const patio = await this.prisma.patios.create({
            data: {
                name: dto.name,
                address: dto.address,
            },
        });
        return this.mapToPatioDto(patio);
    }
    async findAll(query) {
        const { search, limit = 50, order = 'desc' } = query;
        const where = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        const [data, total] = await Promise.all([
            this.prisma.patios.findMany({
                where,
                take: limit,
                orderBy: { updated_at: order },
            }),
            this.prisma.patios.count({ where }),
        ]);
        const patios = data.map(this.mapToPatioDto);
        return {
            data: patios,
            total,
            limit,
            hasMore: total > limit,
        };
    }
    async findPublic() {
        const patios = await this.prisma.patios.findMany({
            select: {
                id: true,
                name: true,
                address: true,
            },
        });
        return patios.map((patio) => ({
            patioId: patio.id,
            name: patio.name,
            address: patio.address,
        }));
    }
    async findOne(id) {
        const patio = await this.prisma.patios.findUnique({
            where: { id },
        });
        if (!patio) {
            return null;
        }
        return this.mapToPatioDto(patio);
    }
    async update(id, dto) {
        try {
            const patio = await this.prisma.patios.update({
                where: { id },
                data: {
                    name: dto.name,
                    address: dto.address,
                },
            });
            return this.mapToPatioDto(patio);
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return null;
                }
            }
            throw error;
        }
    }
    async delete(id) {
        try {
            const machineCount = await this.prisma.machines.count({
                where: { patio_id: id },
            });
            if (machineCount > 0) {
                return false;
            }
            await this.prisma.patios.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return false;
                }
            }
            throw error;
        }
    }
    async findMachinesInPatio(patioId, query) {
        const { search, status, limit = 50, order = 'desc' } = query;
        const where = {
            patio_id: patioId,
        };
        if (search) {
            where.OR = [
                { machine_key: { contains: search, mode: 'insensitive' } },
                { meta: { path: ['tag'], string_contains: search } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const [data, total] = await Promise.all([
            this.prisma.machines.findMany({
                where,
                take: limit,
                orderBy: { updated_at: order },
                include: {
                    patios: true,
                    devices: {
                        select: {
                            device_id: true,
                            fw_version: true,
                            last_seen_at: true,
                            status: true,
                        },
                    },
                },
            }),
            this.prisma.machines.count({ where }),
        ]);
        const machines = data.map((machine) => ({
            id: machine.id,
            machineKey: machine.machine_key,
            patioId: machine.patio_id,
            patioName: machine.patios?.name,
            manufacturer: machine.manufacturer,
            model: machine.model,
            status: machine.status,
            operatorUserId: machine.operator_user_id,
            meta: machine.meta,
            createdAt: machine.created_at,
            updatedAt: machine.updated_at,
            device: machine.devices?.[0]
                ? {
                    deviceId: machine.devices[0].device_id,
                    fwVersion: machine.devices[0].fw_version,
                    lastSeenAt: machine.devices[0].last_seen_at,
                    status: machine.devices[0].status,
                }
                : undefined,
        }));
        return {
            data: machines,
            total,
            limit,
            hasMore: total > limit,
        };
    }
    mapToPatioDto(patio) {
        return {
            id: patio.id,
            name: patio.name,
            address: patio.address,
            createdAt: patio.created_at,
            updatedAt: patio.updated_at,
        };
    }
};
exports.PatiosRepository = PatiosRepository;
exports.PatiosRepository = PatiosRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatiosRepository);
//# sourceMappingURL=patios.repository.js.map