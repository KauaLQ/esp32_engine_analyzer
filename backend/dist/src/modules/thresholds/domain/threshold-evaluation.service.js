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
var ThresholdEvaluationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdEvaluationService = void 0;
const common_1 = require("@nestjs/common");
const thresholds_repository_1 = require("../repositories/thresholds.repository");
const alarms_service_1 = require("../../alarms/domain/alarms.service");
const dto_1 = require("../../alarms/domain/dto");
let ThresholdEvaluationService = ThresholdEvaluationService_1 = class ThresholdEvaluationService {
    thresholdsRepository;
    alarmsService;
    logger = new common_1.Logger(ThresholdEvaluationService_1.name);
    constructor(thresholdsRepository, alarmsService) {
        this.thresholdsRepository = thresholdsRepository;
        this.alarmsService = alarmsService;
    }
    async evaluateAndEmitAlarms(machineId, reading) {
        try {
            const profile = await this.thresholdsRepository.findActiveProfile(machineId);
            if (!profile || !profile.payload.thresholds) {
                return;
            }
            const { thresholds } = profile.payload;
            const { voltageV, currentA, temperatureC, ts } = reading;
            if (voltageV !== undefined && thresholds.voltage) {
                await this.evaluateVoltage(machineId, voltageV, thresholds.voltage, ts, profile.id);
            }
            if (currentA !== undefined && thresholds.current) {
                await this.evaluateCurrent(machineId, currentA, thresholds.current, ts, profile.id);
            }
            if (temperatureC !== undefined && thresholds.temperature_tcase) {
                await this.evaluateTemperature(machineId, temperatureC, thresholds.temperature_tcase, ts, profile.id);
            }
        }
        catch (error) {
            this.logger.error(`Error evaluating thresholds for machine ${machineId}: ${error.message}`);
        }
    }
    async evaluateVoltage(machineId, voltageV, thresholds, ts, profileId) {
        if (thresholds.crit_high_v && voltageV > thresholds.crit_high_v) {
            const delta = voltageV - thresholds.crit_high_v;
            await this.createVoltageAlarm(machineId, 'high', voltageV, thresholds.crit_high_v, delta, ts, profileId, dto_1.AlarmSeverity.CRIT);
        }
        else if (thresholds.warn_high_v && voltageV > thresholds.warn_high_v) {
            const delta = voltageV - thresholds.warn_high_v;
            await this.createVoltageAlarm(machineId, 'high', voltageV, thresholds.warn_high_v, delta, ts, profileId, dto_1.AlarmSeverity.WARN);
        }
        else {
            await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:voltage:high');
        }
        if (thresholds.crit_low_v && voltageV < thresholds.crit_low_v) {
            const delta = thresholds.crit_low_v - voltageV;
            await this.createVoltageAlarm(machineId, 'low', voltageV, thresholds.crit_low_v, delta, ts, profileId, dto_1.AlarmSeverity.CRIT);
        }
        else if (thresholds.warn_low_v && voltageV < thresholds.warn_low_v) {
            const delta = thresholds.warn_low_v - voltageV;
            await this.createVoltageAlarm(machineId, 'low', voltageV, thresholds.warn_low_v, delta, ts, profileId, dto_1.AlarmSeverity.WARN);
        }
        else {
            await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:voltage:low');
        }
    }
    async evaluateCurrent(machineId, currentA, thresholds, ts, profileId) {
        if (thresholds.crit_high_a && currentA > thresholds.crit_high_a) {
            const delta = currentA - thresholds.crit_high_a;
            await this.createCurrentAlarm(machineId, 'high', currentA, thresholds.crit_high_a, delta, ts, profileId, dto_1.AlarmSeverity.CRIT);
        }
        else if (thresholds.warn_high_a && currentA > thresholds.warn_high_a) {
            const delta = currentA - thresholds.warn_high_a;
            await this.createCurrentAlarm(machineId, 'high', currentA, thresholds.warn_high_a, delta, ts, profileId, dto_1.AlarmSeverity.WARN);
        }
        else {
            await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:current:high');
        }
    }
    async evaluateTemperature(machineId, temperatureC, thresholds, ts, profileId) {
        if (thresholds.crit_high_c && temperatureC > thresholds.crit_high_c) {
            const delta = temperatureC - thresholds.crit_high_c;
            await this.createTemperatureAlarm(machineId, 'high', temperatureC, thresholds.crit_high_c, delta, ts, profileId, dto_1.AlarmSeverity.CRIT);
        }
        else if (thresholds.warn_high_c && temperatureC > thresholds.warn_high_c) {
            const delta = temperatureC - thresholds.warn_high_c;
            await this.createTemperatureAlarm(machineId, 'high', temperatureC, thresholds.warn_high_c, delta, ts, profileId, dto_1.AlarmSeverity.WARN);
        }
        else {
            await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:temperature:high');
        }
    }
    async createVoltageAlarm(machineId, direction, value, limit, delta, readingTs, thresholdProfileId, severityRule) {
        const dedupeKey = `threshold:voltage:${direction}`;
        const readingDate = new Date(readingTs);
        const formattedDate = `${readingDate.getDate()}/${readingDate.getMonth() + 1}/${readingDate.getFullYear()}`;
        const title = `Em ${formattedDate} a máquina ${machineId} ficou ${delta.toFixed(1)}V ${direction === 'high' ? 'acima' : 'abaixo'} do limite (${limit}V)`;
        const details = {
            metric: 'voltage',
            direction,
            value,
            limit,
            delta,
            unit: 'V',
            readingTs,
            thresholdProfileId,
            severityRule,
        };
        await this.alarmsService.createOrUpdateThresholdAlarm(machineId, dedupeKey, severityRule, title, details);
    }
    async createCurrentAlarm(machineId, direction, value, limit, delta, readingTs, thresholdProfileId, severityRule) {
        const dedupeKey = `threshold:current:${direction}`;
        const readingDate = new Date(readingTs);
        const formattedDate = `${readingDate.getDate()}/${readingDate.getMonth() + 1}/${readingDate.getFullYear()}`;
        const title = `Em ${formattedDate} a máquina ${machineId} ficou ${delta.toFixed(1)}A acima do limite (${limit}A)`;
        const details = {
            metric: 'current',
            direction,
            value,
            limit,
            delta,
            unit: 'A',
            readingTs,
            thresholdProfileId,
            severityRule,
        };
        await this.alarmsService.createOrUpdateThresholdAlarm(machineId, dedupeKey, severityRule, title, details);
    }
    async createTemperatureAlarm(machineId, direction, value, limit, delta, readingTs, thresholdProfileId, severityRule) {
        const dedupeKey = `threshold:temperature:${direction}`;
        const readingDate = new Date(readingTs);
        const formattedDate = `${readingDate.getDate()}/${readingDate.getMonth() + 1}/${readingDate.getFullYear()}`;
        const title = `Em ${formattedDate} a máquina ${machineId} ficou ${delta.toFixed(1)}°C acima do limite (${limit}°C)`;
        const details = {
            metric: 'temperature',
            direction,
            value,
            limit,
            delta,
            unit: 'C',
            readingTs,
            thresholdProfileId,
            severityRule,
        };
        await this.alarmsService.createOrUpdateThresholdAlarm(machineId, dedupeKey, severityRule, title, details);
    }
};
exports.ThresholdEvaluationService = ThresholdEvaluationService;
exports.ThresholdEvaluationService = ThresholdEvaluationService = ThresholdEvaluationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [thresholds_repository_1.ThresholdsRepository,
        alarms_service_1.AlarmsService])
], ThresholdEvaluationService);
//# sourceMappingURL=threshold-evaluation.service.js.map