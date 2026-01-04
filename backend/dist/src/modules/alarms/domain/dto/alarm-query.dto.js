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
exports.AlarmQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const alarm_dto_1 = require("./alarm.dto");
class AlarmQueryDto {
    machineId;
    status;
    severity;
    from;
    to;
    limit = 50;
}
exports.AlarmQueryDto = AlarmQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by machine ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AlarmQueryDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by alarm status',
        enum: alarm_dto_1.AlarmStatus,
    }),
    (0, class_validator_1.IsEnum)(alarm_dto_1.AlarmStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AlarmQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by alarm severity',
        enum: alarm_dto_1.AlarmSeverity,
    }),
    (0, class_validator_1.IsEnum)(alarm_dto_1.AlarmSeverity),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AlarmQueryDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by start date (ISO format)',
        example: '2023-01-01T00:00:00Z',
    }),
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AlarmQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by end date (ISO format)',
        example: '2023-12-31T23:59:59Z',
    }),
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AlarmQueryDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of results to return',
        default: 50,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AlarmQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=alarm-query.dto.js.map