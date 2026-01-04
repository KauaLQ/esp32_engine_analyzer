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
exports.MachineDetailDto = exports.MachineDto = exports.DeviceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const prisma_types_1 = require("../../../../prisma/prisma.types");
class DeviceDto {
    id;
    deviceId;
    fwVersion;
    lastSeenAt;
    pairedAt;
}
exports.DeviceDto = DeviceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'Unique identifier for the device',
    }),
    __metadata("design:type", String)
], DeviceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ROTORIAL-ESP32-A1B2C3',
        description: 'Device identifier',
    }),
    __metadata("design:type", String)
], DeviceDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1.0.0',
        description: 'Firmware version',
        nullable: true,
    }),
    __metadata("design:type", Object)
], DeviceDto.prototype, "fwVersion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Timestamp when the device was last seen',
        nullable: true,
    }),
    __metadata("design:type", Object)
], DeviceDto.prototype, "lastSeenAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Timestamp when the device was paired with the machine',
        nullable: true,
    }),
    __metadata("design:type", Object)
], DeviceDto.prototype, "pairedAt", void 0);
class MachineDto {
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
    device;
    lastSeenAt;
}
exports.MachineDto = MachineDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'Unique identifier for the machine',
    }),
    __metadata("design:type", String)
], MachineDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'MTR-001',
        description: 'External key for the machine',
    }),
    __metadata("design:type", String)
], MachineDto.prototype, "machineKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
        description: 'ID of the patio where the machine is located',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MachineDto.prototype, "patioId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'WEG',
        description: 'Manufacturer of the machine',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MachineDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'W22',
        description: 'Model of the machine',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MachineDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'operante',
        description: 'Status of the machine',
        enum: prisma_types_1.MachineStatus,
    }),
    __metadata("design:type", String)
], MachineDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
        description: 'ID of the operator user',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MachineDto.prototype, "operatorUserId", void 0);
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
], MachineDto.prototype, "meta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", Date)
], MachineDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", Date)
], MachineDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: DeviceDto,
        description: 'Associated device',
        nullable: true,
    }),
    __metadata("design:type", DeviceDto)
], MachineDto.prototype, "device", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Timestamp when the device was last seen',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MachineDto.prototype, "lastSeenAt", void 0);
class MachineDetailDto extends MachineDto {
    latestReading;
}
exports.MachineDetailDto = MachineDetailDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: {
            voltageV: 221.7,
            currentA: 12.4,
            temperatureC: 49.2,
            seq: 120,
        },
        description: 'Latest telemetry reading',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MachineDetailDto.prototype, "latestReading", void 0);
//# sourceMappingURL=machine.dto.js.map