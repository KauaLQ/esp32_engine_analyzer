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
exports.ProvisionResponseDto = exports.TelemetryInfoDto = exports.DeviceResponseDto = exports.MachineResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const prisma_types_1 = require("../../../../prisma/prisma.types");
class MachineResponseDto {
    id;
    machineKey;
    patioId;
    manufacturer;
    model;
    status;
    operatorUserId;
    meta;
    createdAt;
    updatedAt;
}
exports.MachineResponseDto = MachineResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'Unique identifier for the machine',
    }),
    __metadata("design:type", String)
], MachineResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'MTR-001',
        description: 'External key for the machine',
    }),
    __metadata("design:type", String)
], MachineResponseDto.prototype, "machineKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
        description: 'ID of the patio where the machine is located',
        required: false,
    }),
    __metadata("design:type", Object)
], MachineResponseDto.prototype, "patioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'WEG',
        description: 'Manufacturer of the machine',
        required: false,
    }),
    __metadata("design:type", String)
], MachineResponseDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'W22',
        description: 'Model of the machine',
        required: false,
    }),
    __metadata("design:type", String)
], MachineResponseDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'operante',
        description: 'Status of the machine',
        enum: prisma_types_1.MachineStatus,
    }),
    __metadata("design:type", String)
], MachineResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
        description: 'ID of the operator user',
        required: false,
    }),
    __metadata("design:type", Object)
], MachineResponseDto.prototype, "operatorUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            tag: 'MTR-001',
            powerKw: 15,
            voltageNominal: 220,
            notes: 'Motor da linha 3',
        },
        description: 'Additional metadata for the machine',
    }),
    __metadata("design:type", Object)
], MachineResponseDto.prototype, "meta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", Date)
], MachineResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", Date)
], MachineResponseDto.prototype, "updatedAt", void 0);
class DeviceResponseDto {
    deviceId;
    fwVersion;
    pairedAt;
    lastSeenAt;
}
exports.DeviceResponseDto = DeviceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ROTORIAL-ESP32-A1B2C3',
        description: 'Unique identifier for the device',
    }),
    __metadata("design:type", String)
], DeviceResponseDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1.0.0',
        description: 'Firmware version of the device',
        required: false,
    }),
    __metadata("design:type", Object)
], DeviceResponseDto.prototype, "fwVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Timestamp when the device was paired with the machine',
    }),
    __metadata("design:type", Object)
], DeviceResponseDto.prototype, "pairedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Timestamp when the device was last seen',
        required: false,
    }),
    __metadata("design:type", Object)
], DeviceResponseDto.prototype, "lastSeenAt", void 0);
class TelemetryInfoDto {
    machineId;
    httpEndpoint;
}
exports.TelemetryInfoDto = TelemetryInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'ID of the machine for telemetry readings',
    }),
    __metadata("design:type", String)
], TelemetryInfoDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/telemetry',
        description: 'HTTP endpoint for sending telemetry data',
    }),
    __metadata("design:type", String)
], TelemetryInfoDto.prototype, "httpEndpoint", void 0);
class ProvisionResponseDto {
    machine;
    device;
    telemetry;
}
exports.ProvisionResponseDto = ProvisionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: MachineResponseDto,
        description: 'Machine information',
    }),
    __metadata("design:type", MachineResponseDto)
], ProvisionResponseDto.prototype, "machine", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: DeviceResponseDto,
        description: 'Device information',
    }),
    __metadata("design:type", DeviceResponseDto)
], ProvisionResponseDto.prototype, "device", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: TelemetryInfoDto,
        description: 'Telemetry information',
    }),
    __metadata("design:type", TelemetryInfoDto)
], ProvisionResponseDto.prototype, "telemetry", void 0);
//# sourceMappingURL=provision-response.dto.js.map