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
exports.CreateTelemetryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTelemetryDto {
    machineId;
    voltageV;
    currentA;
    temperatureC;
    seq;
}
exports.CreateTelemetryDto = CreateTelemetryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'The ID of the machine',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTelemetryDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 221.7,
        description: 'The voltage in volts',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTelemetryDto.prototype, "voltageV", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12.4,
        description: 'The current in amperes',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTelemetryDto.prototype, "currentA", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 49.2,
        description: 'The temperature in Celsius',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTelemetryDto.prototype, "temperatureC", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'The sequence number',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateTelemetryDto.prototype, "seq", void 0);
//# sourceMappingURL=create-telemetry.dto.js.map