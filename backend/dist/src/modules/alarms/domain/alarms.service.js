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
exports.AlarmsService = void 0;
const common_1 = require("@nestjs/common");
const alarms_repository_1 = require("../repositories/alarms.repository");
const dto_1 = require("./dto");
let AlarmsService = class AlarmsService {
    alarmsRepository;
    constructor(alarmsRepository) {
        this.alarmsRepository = alarmsRepository;
    }
    async create(createDto, userId) {
        return this.alarmsRepository.create(createDto, userId);
    }
    async findAll(query) {
        const result = await this.alarmsRepository.findAll(query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                limit: result.limit,
                hasMore: result.hasMore,
            },
        };
    }
    async findById(id) {
        const alarm = await this.alarmsRepository.findById(id);
        if (!alarm) {
            throw new common_1.NotFoundException(`Alarm with ID ${id} not found`);
        }
        return alarm;
    }
    async acknowledge(id, userId) {
        const alarm = await this.findById(id);
        if (alarm.status !== dto_1.AlarmStatus.OPEN) {
            throw new Error(`Cannot acknowledge alarm with status ${alarm.status}`);
        }
        return this.alarmsRepository.acknowledge(id, userId);
    }
    async close(id, userId) {
        const alarm = await this.findById(id);
        if (alarm.status === dto_1.AlarmStatus.CLOSED) {
            throw new Error('Alarm is already closed');
        }
        return this.alarmsRepository.close(id, userId);
    }
    async delete(id) {
        const alarm = await this.findById(id);
        return this.alarmsRepository.delete(id);
    }
    async createOrUpdateThresholdAlarm(machineId, dedupeKey, severity, title, details) {
        const existingAlarm = await this.alarmsRepository.findByDedupeKey(machineId, dedupeKey, dto_1.AlarmStatus.OPEN);
        if (existingAlarm) {
            await this.alarmsRepository.updateLastSeen(existingAlarm.id);
            if (this.isSeverityHigher(severity, existingAlarm.severity)) {
                await this.alarmsRepository.updateSeverity(existingAlarm.id, severity);
            }
            return this.alarmsRepository.updateDetails(existingAlarm.id, title, details);
        }
        else {
            return this.create({
                machineId,
                type: 'threshold_breach',
                severity,
                title,
                details,
                dedupeKey,
            });
        }
    }
    async closeThresholdAlarm(machineId, dedupeKey) {
        const existingAlarm = await this.alarmsRepository.findByDedupeKey(machineId, dedupeKey, dto_1.AlarmStatus.OPEN);
        if (existingAlarm) {
            await this.alarmsRepository.close(existingAlarm.id, "");
        }
    }
    isSeverityHigher(newSeverity, currentSeverity) {
        const severityOrder = {
            [dto_1.AlarmSeverity.INFO]: 1,
            [dto_1.AlarmSeverity.WARN]: 2,
            [dto_1.AlarmSeverity.CRIT]: 3,
        };
        return severityOrder[newSeverity] > severityOrder[currentSeverity];
    }
};
exports.AlarmsService = AlarmsService;
exports.AlarmsService = AlarmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alarms_repository_1.AlarmsRepository])
], AlarmsService);
//# sourceMappingURL=alarms.service.js.map