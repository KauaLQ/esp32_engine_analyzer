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
exports.DashboardMetricsResponseDto = exports.AveragesDto = exports.GlobalStatsDto = exports.AlarmsDto = exports.OpenAlarmsBySeverityDto = exports.AlarmsBySeverityDto = exports.AlarmsByStatusDto = exports.DashboardMetricsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DashboardMetricsQueryDto {
    from;
    to;
}
exports.DashboardMetricsQueryDto = DashboardMetricsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Start timestamp (ISO8601)',
        example: '2023-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({ strict: true }),
    __metadata("design:type", String)
], DashboardMetricsQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'End timestamp (ISO8601)',
        example: '2023-01-31T23:59:59.999Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({ strict: true }),
    __metadata("design:type", String)
], DashboardMetricsQueryDto.prototype, "to", void 0);
class AlarmsByStatusDto {
    open;
    ack;
    closed;
}
exports.AlarmsByStatusDto = AlarmsByStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], AlarmsByStatusDto.prototype, "open", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], AlarmsByStatusDto.prototype, "ack", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], AlarmsByStatusDto.prototype, "closed", void 0);
class AlarmsBySeverityDto {
    info;
    warn;
    crit;
}
exports.AlarmsBySeverityDto = AlarmsBySeverityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], AlarmsBySeverityDto.prototype, "info", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7 }),
    __metadata("design:type", Number)
], AlarmsBySeverityDto.prototype, "warn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], AlarmsBySeverityDto.prototype, "crit", void 0);
class OpenAlarmsBySeverityDto {
    info;
    warn;
    crit;
}
exports.OpenAlarmsBySeverityDto = OpenAlarmsBySeverityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], OpenAlarmsBySeverityDto.prototype, "info", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OpenAlarmsBySeverityDto.prototype, "warn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], OpenAlarmsBySeverityDto.prototype, "crit", void 0);
class AlarmsDto {
    byStatus;
    bySeverity;
    openBySeverity;
}
exports.AlarmsDto = AlarmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: AlarmsByStatusDto }),
    __metadata("design:type", AlarmsByStatusDto)
], AlarmsDto.prototype, "byStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AlarmsBySeverityDto }),
    __metadata("design:type", AlarmsBySeverityDto)
], AlarmsDto.prototype, "bySeverity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: OpenAlarmsBySeverityDto }),
    __metadata("design:type", OpenAlarmsBySeverityDto)
], AlarmsDto.prototype, "openBySeverity", void 0);
class GlobalStatsDto {
    machinesTotal;
    patiosTotal;
    alarms;
}
exports.GlobalStatsDto = GlobalStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    __metadata("design:type", Number)
], GlobalStatsDto.prototype, "machinesTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    __metadata("design:type", Number)
], GlobalStatsDto.prototype, "patiosTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AlarmsDto }),
    __metadata("design:type", AlarmsDto)
], GlobalStatsDto.prototype, "alarms", void 0);
class AveragesDto {
    avgVoltageV;
    avgCurrentA;
    avgTemperatureC;
    avgPowerKw;
    avgEnergyKwh;
    avgKgco2e;
}
exports.AveragesDto = AveragesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 221.7, nullable: true }),
    __metadata("design:type", Object)
], AveragesDto.prototype, "avgVoltageV", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12.4, nullable: true }),
    __metadata("design:type", Object)
], AveragesDto.prototype, "avgCurrentA", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 49.2, nullable: true }),
    __metadata("design:type", Object)
], AveragesDto.prototype, "avgTemperatureC", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75.5, nullable: true }),
    __metadata("design:type", Object)
], AveragesDto.prototype, "avgPowerKw", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.2, nullable: true }),
    __metadata("design:type", Object)
], AveragesDto.prototype, "avgEnergyKwh", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30.5, nullable: true }),
    __metadata("design:type", Object)
], AveragesDto.prototype, "avgKgco2e", void 0);
class DashboardMetricsResponseDto {
    globalStats;
    averages;
}
exports.DashboardMetricsResponseDto = DashboardMetricsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: GlobalStatsDto }),
    __metadata("design:type", GlobalStatsDto)
], DashboardMetricsResponseDto.prototype, "globalStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AveragesDto }),
    __metadata("design:type", AveragesDto)
], DashboardMetricsResponseDto.prototype, "averages", void 0);
//# sourceMappingURL=dashboard-metrics.dto.js.map