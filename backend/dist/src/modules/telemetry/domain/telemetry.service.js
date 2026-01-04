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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const common_1 = require("@nestjs/common");
const telemetry_repository_1 = require("../repositories/telemetry.repository");
const machines_service_1 = require("../../machines/domain/machines.service");
const alarms_evaluator_service_1 = require("../../alarms/domain/alarms-evaluator.service");
const emissions_service_1 = require("../../emissions/domain/emissions.service");
let TelemetryService = class TelemetryService {
    telemetryRepository;
    machinesService;
    alarmsEvaluatorService;
    emissionsService;
    constructor(telemetryRepository, machinesService, alarmsEvaluatorService, emissionsService) {
        this.telemetryRepository = telemetryRepository;
        this.machinesService = machinesService;
        this.alarmsEvaluatorService = alarmsEvaluatorService;
        this.emissionsService = emissionsService;
    }
    async create(createTelemetryDto) {
        const serverTs = new Date().toISOString();
        const telemetryWithServerTs = {
            ...createTelemetryDto,
            ts: serverTs,
        };
        const reading = await this.telemetryRepository.create(telemetryWithServerTs);
        this.machinesService.updateDeviceLastSeen(reading.machineId).catch((error) => {
            console.error('Failed to update device last seen timestamp:', error);
        });
        await this.alarmsEvaluatorService.evaluateAndUpsert(reading.machineId, {
            machineId: reading.machineId,
            ts: reading.ts,
            voltageV: reading.voltageV,
            currentA: reading.currentA,
            temperatureC: reading.temperatureC,
            seq: reading.seq,
        });
        this.emissionsService
            .computeAndPersist(reading.machineId, reading.id)
            .catch((error) => {
            console.error('Failed to compute emissions:', error);
        });
        return reading;
    }
    async findAll(query) {
        const result = await this.telemetryRepository.findAll(query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                limit: result.limit,
                hasMore: result.hasMore,
            },
        };
    }
    async findLatest(machineId) {
        const reading = await this.telemetryRepository.findLatest(machineId);
        if (!reading) {
            throw new common_1.NotFoundException(`No telemetry readings found for machine ${machineId}`);
        }
        return reading;
    }
    async findSeries(metric, query) {
        const result = await this.telemetryRepository.findSeries(metric, query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                bucket: result.bucket,
                fill: result.fill,
                from: result.from,
                to: result.to,
            },
        };
    }
    async findMultiSeries(query) {
        const result = await this.telemetryRepository.findMultiSeries(query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                bucket: result.bucket,
                fill: result.fill,
                from: result.from,
                to: result.to,
            },
        };
    }
    async delete(id) {
        try {
            await this.telemetryRepository.delete(id);
        }
        catch (error) {
            throw new common_1.NotFoundException(`Telemetry reading with ID ${id} not found`);
        }
    }
};
exports.TelemetryService = TelemetryService;
exports.TelemetryService = TelemetryService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => emissions_service_1.EmissionsService))),
    __metadata("design:paramtypes", [telemetry_repository_1.TelemetryRepository,
        machines_service_1.MachinesService,
        alarms_evaluator_service_1.AlarmsEvaluatorService,
        emissions_service_1.EmissionsService])
], TelemetryService);
//# sourceMappingURL=telemetry.service.js.map