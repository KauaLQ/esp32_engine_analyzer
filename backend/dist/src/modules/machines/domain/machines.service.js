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
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const machines_repository_1 = require("../repositories/machines.repository");
let MachinesService = class MachinesService {
    machinesRepository;
    constructor(machinesRepository) {
        this.machinesRepository = machinesRepository;
    }
    async provision(dto) {
        try {
            const { machine, device } = await this.machinesRepository.provision(dto);
            return {
                machine: {
                    id: machine.id,
                    machineKey: machine.machine_key,
                    patioId: machine.patio_id,
                    manufacturer: machine.manufacturer,
                    model: machine.model,
                    status: machine.status,
                    operatorUserId: machine.operator_user_id,
                    meta: machine.meta,
                    createdAt: machine.created_at,
                    updatedAt: machine.updated_at,
                },
                device: {
                    deviceId: device.device_id,
                    fwVersion: device.fw_version,
                    pairedAt: device.paired_at,
                    lastSeenAt: device.last_seen_at,
                },
                telemetry: {
                    machineId: machine.id,
                    httpEndpoint: '/telemetry',
                },
            };
        }
        catch (error) {
            if (error.message.includes('already paired')) {
                throw new common_1.ConflictException(error.message);
            }
            throw error;
        }
    }
    async findAll(query) {
        const result = await this.machinesRepository.findAll(query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                limit: result.limit,
                hasMore: result.hasMore,
            },
        };
    }
    async findOne(id) {
        const machine = await this.machinesRepository.findOne(id);
        if (!machine) {
            throw new common_1.NotFoundException(`Machine with ID ${id} not found`);
        }
        return {
            ...machine,
            latestReading: undefined,
        };
    }
    async update(id, dto) {
        const machine = await this.machinesRepository.update(id, dto);
        if (!machine) {
            throw new common_1.NotFoundException(`Machine with ID ${id} not found`);
        }
        return machine;
    }
    async updateDeviceLastSeen(machineId) {
        await this.machinesRepository.updateDeviceLastSeen(machineId);
    }
    async delete(id) {
        const machine = await this.machinesRepository.findOne(id);
        if (!machine) {
            throw new common_1.NotFoundException(`Machine with ID ${id} not found`);
        }
        return this.machinesRepository.delete(id);
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [machines_repository_1.MachinesRepository])
], MachinesService);
//# sourceMappingURL=machines.service.js.map