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
exports.CreateAlarmDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const alarm_dto_1 = require("./alarm.dto");
class CreateAlarmDto {
    machineId;
    type = 'manual';
    severity;
    title;
    details;
    dedupeKey;
}
exports.CreateAlarmDto = CreateAlarmDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Machine ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAlarmDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alarm type',
        default: 'manual',
        example: 'manual',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAlarmDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alarm severity',
        enum: alarm_dto_1.AlarmSeverity,
        example: alarm_dto_1.AlarmSeverity.WARN,
    }),
    (0, class_validator_1.IsEnum)(alarm_dto_1.AlarmSeverity),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAlarmDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alarm title',
        example: 'High temperature detected',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAlarmDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alarm details',
        type: 'object',
        additionalProperties: true,
        example: {
            metric: 'temperature',
            value: 95,
            limit: 90,
            unit: 'C',
        },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAlarmDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Deduplication key',
        example: 'manual:high-temp',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAlarmDto.prototype, "dedupeKey", void 0);
//# sourceMappingURL=create-alarm.dto.js.map