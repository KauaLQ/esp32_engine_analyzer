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
var AlarmsEvaluatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlarmsEvaluatorService = void 0;
const common_1 = require("@nestjs/common");
const alarms_service_1 = require("./alarms.service");
const thresholds_repository_1 = require("../../thresholds/repositories/thresholds.repository");
const dto_1 = require("./dto");
let AlarmsEvaluatorService = AlarmsEvaluatorService_1 = class AlarmsEvaluatorService {
    alarmsService;
    thresholdsRepository;
    logger = new common_1.Logger(AlarmsEvaluatorService_1.name);
    constructor(alarmsService, thresholdsRepository) {
        this.alarmsService = alarmsService;
        this.thresholdsRepository = thresholdsRepository;
    }
    async evaluateAndUpsert(machineId, reading) {
        try {
            const profile = await this.thresholdsRepository.findActiveProfile(machineId);
            console.log("Verificando o threshold atual: " + profile?.payload.thresholds.voltage.hard_max_v);
            const thresholds = profile?.payload?.thresholds;
            console.log(thresholds);
            if (!thresholds)
                return;
            const { voltageV, currentA, temperatureC, ts, seq } = reading;
            const violations = [];
            if (typeof voltageV === 'number' && thresholds.voltage) {
                violations.push(...this.evaluateVoltage(voltageV, thresholds.voltage));
            }
            if (typeof currentA === 'number' && thresholds.current) {
                violations.push(...this.evaluateCurrent(currentA, thresholds.current));
            }
            if (typeof temperatureC === 'number' && thresholds.temperature_tcase) {
                violations.push(...this.evaluateTemperature(temperatureC, thresholds.temperature_tcase));
            }
            console.log(violations);
            for (const violation of violations) {
                await this.createOrUpdateAlarm(machineId, violation, { ts, seq });
            }
        }
        catch (error) {
            this.logger.error(`Error evaluating thresholds for machine ${machineId}: ${error?.message ?? error}`);
        }
    }
    evaluateVoltage(value, t) {
        const violations = [];
        if (typeof t.hard_max_v === 'number' && value > t.hard_max_v) {
            violations.push({ metric: 'voltage', kind: 'HIGH', value, limit: t.hard_max_v, level: 'HARD', unit: 'V' });
        }
        else if (typeof t.crit_high_v === 'number' && value > t.crit_high_v) {
            violations.push({ metric: 'voltage', kind: 'HIGH', value, limit: t.crit_high_v, level: 'CRIT', unit: 'V' });
        }
        else if (typeof t.warn_high_v === 'number' && value > t.warn_high_v) {
            violations.push({ metric: 'voltage', kind: 'HIGH', value, limit: t.warn_high_v, level: 'WARN', unit: 'V' });
        }
        if (typeof t.hard_min_v === 'number' && value < t.hard_min_v) {
            violations.push({ metric: 'voltage', kind: 'LOW', value, limit: t.hard_min_v, level: 'HARD', unit: 'V' });
        }
        else if (typeof t.crit_low_v === 'number' && value < t.crit_low_v) {
            violations.push({ metric: 'voltage', kind: 'LOW', value, limit: t.crit_low_v, level: 'CRIT', unit: 'V' });
        }
        else if (typeof t.warn_low_v === 'number' && value < t.warn_low_v) {
            violations.push({ metric: 'voltage', kind: 'LOW', value, limit: t.warn_low_v, level: 'WARN', unit: 'V' });
        }
        return violations;
    }
    evaluateCurrent(value, t) {
        const violations = [];
        if (typeof t.hard_max_a === 'number' && value > t.hard_max_a) {
            violations.push({ metric: 'current', kind: 'HIGH', value, limit: t.hard_max_a, level: 'HARD', unit: 'A' });
        }
        else if (typeof t.crit_high_a === 'number' && value > t.crit_high_a) {
            violations.push({ metric: 'current', kind: 'HIGH', value, limit: t.crit_high_a, level: 'CRIT', unit: 'A' });
        }
        else if (typeof t.warn_high_a === 'number' && value > t.warn_high_a) {
            violations.push({ metric: 'current', kind: 'HIGH', value, limit: t.warn_high_a, level: 'WARN', unit: 'A' });
        }
        return violations;
    }
    evaluateTemperature(value, t) {
        const violations = [];
        if (typeof t.hard_max_c === 'number' && value > t.hard_max_c) {
            violations.push({ metric: 'temperature', kind: 'HIGH', value, limit: t.hard_max_c, level: 'HARD', unit: 'C' });
        }
        else if (typeof t.crit_high_c === 'number' && value > t.crit_high_c) {
            violations.push({ metric: 'temperature', kind: 'HIGH', value, limit: t.crit_high_c, level: 'CRIT', unit: 'C' });
        }
        else if (typeof t.warn_high_c === 'number' && value > t.warn_high_c) {
            violations.push({ metric: 'temperature', kind: 'HIGH', value, limit: t.warn_high_c, level: 'WARN', unit: 'C' });
        }
        return violations;
    }
    async createOrUpdateAlarm(machineId, violation, reading) {
        const { metric, kind, value, limit, level, unit } = violation;
        const dedupeKey = `threshold:${metric}:${level}:${kind}`;
        const severity = level === 'HARD' || level === 'CRIT'
            ? dto_1.AlarmSeverity.CRIT
            : level === 'WARN'
                ? dto_1.AlarmSeverity.WARN
                : dto_1.AlarmSeverity.INFO;
        const comparator = kind === 'HIGH' ? '>' : '<';
        const title = `${this.getMetricName(metric, kind)}: ${value}${unit} ${comparator} ${level.toLowerCase()}(${limit}${unit})`;
        const details = {
            metric,
            kind,
            value,
            limit,
            level,
            unit,
            reading: { ts: reading.ts, seq: reading.seq },
        };
        await this.alarmsService.createOrUpdateThresholdAlarm(machineId, dedupeKey, severity, title, details);
    }
    getMetricName(metric, kind) {
        switch (metric) {
            case 'voltage':
                return kind === 'HIGH' ? 'Overvoltage' : 'Undervoltage';
            case 'current':
                return 'Overcurrent';
            case 'temperature':
                return 'Overtemperature';
            default:
                return metric;
        }
    }
};
exports.AlarmsEvaluatorService = AlarmsEvaluatorService;
exports.AlarmsEvaluatorService = AlarmsEvaluatorService = AlarmsEvaluatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alarms_service_1.AlarmsService,
        thresholds_repository_1.ThresholdsRepository])
], AlarmsEvaluatorService);
//# sourceMappingURL=alarms-evaluator.service.js.map