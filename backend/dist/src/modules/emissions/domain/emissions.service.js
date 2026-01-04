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
var EmissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmissionsService = void 0;
const common_1 = require("@nestjs/common");
const emissions_repository_1 = require("../repositories/emissions.repository");
const thresholds_repository_1 = require("../../thresholds/repositories/thresholds.repository");
const threshold_profile_types_1 = require("./types/threshold-profile.types");
const emissions_query_dto_1 = require("./dto/emissions-query.dto");
let EmissionsService = EmissionsService_1 = class EmissionsService {
    emissionsRepository;
    thresholdsRepository;
    logger = new common_1.Logger(EmissionsService_1.name);
    constructor(emissionsRepository, thresholdsRepository) {
        this.emissionsRepository = emissionsRepository;
        this.thresholdsRepository = thresholdsRepository;
    }
    async computeAndPersist(machineId, telemetryReadingId) {
        try {
            const currentReading = await this.emissionsRepository.findTelemetryReadingById(telemetryReadingId);
            if (!currentReading) {
                this.logger.warn(`Telemetry reading ${telemetryReadingId} not found`);
                return;
            }
            const previousReading = await this.emissionsRepository.findPreviousTelemetryReading(machineId, currentReading.ts);
            const profile = await this.thresholdsRepository.findActiveProfile(machineId);
            const { fp, vrmsNom, irmsNom } = (0, threshold_profile_types_1.getEmissionInputsFromProfile)(profile?.payload || {});
            const emissionFactor = await this.emissionsRepository.findEmissionFactor(machineId);
            const computed = {
                ts_server: currentReading.ts,
                fp_used: fp,
            };
            const voltageV = currentReading.voltageV ?? vrmsNom;
            const currentA = currentReading.currentA ?? irmsNom;
            computed.vrms_used = voltageV;
            computed.irms_used = currentA;
            if (currentA === null || currentA === undefined) {
                this.logger.warn(`No current value available for telemetry reading ${telemetryReadingId}`);
                computed.flags = ['NO_CURRENT_AVAILABLE'];
                await this.emissionsRepository.updateTelemetryReadingPayload(telemetryReadingId, computed);
                return;
            }
            const powerKw = Math.sqrt(3) * voltageV * currentA * fp / 1000;
            computed.power_kw = powerKw;
            if (previousReading) {
                const currentTs = new Date(currentReading.ts).getTime();
                const previousTs = new Date(previousReading.ts).getTime();
                const deltaHours = (currentTs - previousTs) / 3600000;
                if (deltaHours <= 0 || deltaHours > 2) {
                    computed.flags = computed.flags || [];
                    computed.flags.push(deltaHours <= 0 ? 'NEGATIVE_TIME_DELTA' : 'LARGE_TIME_DELTA');
                    computed.delta_hours = deltaHours;
                }
                else {
                    computed.delta_hours = deltaHours;
                    const energyKwhIncrement = powerKw * deltaHours;
                    computed.energy_kwh_increment = energyKwhIncrement;
                    if (emissionFactor) {
                        const factorValue = Number(emissionFactor.factor_kgco2_per_kwh.toString());
                        computed.emission_factor_used = factorValue;
                        computed.kgco2e_increment = energyKwhIncrement * factorValue;
                    }
                    else {
                        computed.emission_factor_used = 0.0;
                        computed.kgco2e_increment = 0.0;
                        computed.flags = computed.flags || [];
                        computed.flags.push('NO_FACTOR_CONFIGURED');
                    }
                }
            }
            else {
                computed.flags = computed.flags || [];
                computed.flags.push('NO_PREVIOUS_READING');
            }
            await this.emissionsRepository.updateTelemetryReadingPayload(telemetryReadingId, computed);
        }
        catch (error) {
            this.logger.error(`Error computing emissions for machine ${machineId}: ${error.message}`);
        }
    }
    async getSummary(machineId, query) {
        const { from, to } = this.getDefaultTimeRange(query);
        const summary = await this.emissionsRepository.getSummary(machineId, from, to);
        return {
            machineId,
            from,
            to,
            energyKwhTotal: summary.energyKwhTotal,
            kgco2eTotal: summary.kgco2eTotal,
            factorUsed: summary.factorUsed,
            pointsCount: summary.pointsCount,
        };
    }
    async getSeries(machineId, query) {
        const { from, to } = this.getDefaultTimeRange(query);
        const metric = query.metric ?? emissions_query_dto_1.EmissionMetric.KGCO2E;
        const bucket = query.bucket ?? '1h';
        const series = await this.emissionsRepository.getSeries(machineId, from, to, bucket, metric);
        return {
            machineId,
            metric,
            bucket,
            from,
            to,
            points: series.points,
        };
    }
    getDefaultTimeRange(query) {
        const to = query.to || new Date().toISOString();
        const toDate = new Date(to);
        const fromDate = query.from
            ? new Date(query.from)
            : new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
        return {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
        };
    }
};
exports.EmissionsService = EmissionsService;
exports.EmissionsService = EmissionsService = EmissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [emissions_repository_1.EmissionsRepository,
        thresholds_repository_1.ThresholdsRepository])
], EmissionsService);
//# sourceMappingURL=emissions.service.js.map