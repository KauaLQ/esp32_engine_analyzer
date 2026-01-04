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
exports.AlarmDto = exports.AlarmStatus = exports.AlarmSeverity = void 0;
const swagger_1 = require("@nestjs/swagger");
var AlarmSeverity;
(function (AlarmSeverity) {
    AlarmSeverity["INFO"] = "info";
    AlarmSeverity["WARN"] = "warn";
    AlarmSeverity["CRIT"] = "crit";
})(AlarmSeverity || (exports.AlarmSeverity = AlarmSeverity = {}));
var AlarmStatus;
(function (AlarmStatus) {
    AlarmStatus["OPEN"] = "open";
    AlarmStatus["ACK"] = "ack";
    AlarmStatus["CLOSED"] = "closed";
})(AlarmStatus || (exports.AlarmStatus = AlarmStatus = {}));
class AlarmDto {
    id;
    machineId;
    type;
    severity;
    status;
    title;
    details;
    openedAt;
    lastSeenAt;
    ackAt;
    closedAt;
    dedupeKey;
}
exports.AlarmDto = AlarmDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alarm ID' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Machine ID' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alarm type', example: 'manual' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alarm severity',
        enum: AlarmSeverity,
        example: AlarmSeverity.WARN,
    }),
    __metadata("design:type", String)
], AlarmDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alarm status',
        enum: AlarmStatus,
        example: AlarmStatus.OPEN,
    }),
    __metadata("design:type", String)
], AlarmDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alarm title' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        additionalProperties: true,
        description: 'Alarm details',
        type: 'object',
        example: {
            metric: 'temperature',
            value: 95,
            limit: 90,
            unit: 'C',
        },
    }),
    __metadata("design:type", Object)
], AlarmDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the alarm was opened' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "openedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the alarm was last seen' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "lastSeenAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the alarm was acknowledged' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "ackAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the alarm was closed' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "closedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deduplication key' }),
    __metadata("design:type", String)
], AlarmDto.prototype, "dedupeKey", void 0);
//# sourceMappingURL=alarm.dto.js.map