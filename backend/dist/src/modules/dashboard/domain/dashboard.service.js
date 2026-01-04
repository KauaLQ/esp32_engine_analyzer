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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const dashboard_repository_1 = require("../repositories/dashboard.repository");
let DashboardService = class DashboardService {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async getDashboardMetrics(from, to) {
        const toDate = to ? new Date(to) : new Date();
        const fromDate = from
            ? new Date(from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [machinesTotal, patiosTotal, alarmsByStatus, alarmsBySeverity, openAlarmsBySeverity, averages,] = await Promise.all([
            this.dashboardRepository.countMachines(),
            this.dashboardRepository.countPatios(),
            this.dashboardRepository.countAlarmsByStatus(fromDate, toDate),
            this.dashboardRepository.countAlarmsBySeverity(fromDate, toDate),
            this.dashboardRepository.countOpenAlarmsBySeverity(fromDate, toDate),
            this.dashboardRepository.getAverageTelemetryValues(fromDate, toDate),
        ]);
        const byStatus = {
            open: 0,
            ack: 0,
            closed: 0,
        };
        alarmsByStatus.forEach(item => {
            byStatus[item.status] = item.count;
        });
        const bySeverity = {
            info: 0,
            warn: 0,
            crit: 0,
        };
        alarmsBySeverity.forEach(item => {
            bySeverity[item.severity] = item.count;
        });
        const openBySeverity = {
            info: 0,
            warn: 0,
            crit: 0,
        };
        openAlarmsBySeverity.forEach(item => {
            openBySeverity[item.severity] = item.count;
        });
        return {
            globalStats: {
                machinesTotal,
                patiosTotal,
                alarms: {
                    byStatus,
                    bySeverity,
                    openBySeverity,
                },
            },
            averages: {
                avgVoltageV: averages.avgVoltageV,
                avgCurrentA: averages.avgCurrentA,
                avgTemperatureC: averages.avgTemperatureC,
                avgPowerKw: averages.avgPowerKw,
                avgEnergyKwh: averages.avgEnergyKwh,
                avgKgco2e: averages.avgKgco2e,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dashboard_repository_1.DashboardRepository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map