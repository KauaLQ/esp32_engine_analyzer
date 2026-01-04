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
exports.ProvisionRequestDto = exports.MetaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const prisma_types_1 = require("../../../../prisma/prisma.types");
class MetaDto {
    tag;
    powerKw;
    voltageNominal;
    notes;
}
exports.MetaDto = MetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'MTR-001',
        description: 'Tag or identifier for the machine',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetaDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 15,
        description: 'Power in kilowatts',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetaDto.prototype, "powerKw", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 220,
        description: 'Nominal voltage',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetaDto.prototype, "voltageNominal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Motor da linha 3',
        description: 'Additional notes',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetaDto.prototype, "notes", void 0);
class ProvisionRequestDto {
    deviceId;
    machineKey;
    patioId;
    manufacturer;
    model;
    status;
    operatorUserId;
    meta;
    fwVersion;
}
exports.ProvisionRequestDto = ProvisionRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ROTORIAL-ESP32-A1B2C3',
        description: 'Unique identifier for the device',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'MTR-001',
        description: 'External key for the machine',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "machineKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
        description: 'ID of the patio where the machine is located',
        required: false,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "patioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'WEG',
        description: 'Manufacturer of the machine',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'W22',
        description: 'Model of the machine',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'operante',
        description: 'Status of the machine',
        enum: prisma_types_1.MachineStatus,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(prisma_types_1.MachineStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
        description: 'ID of the operator user',
        required: false,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "operatorUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: MetaDto,
        description: 'Additional metadata for the machine',
        required: false,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetaDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", MetaDto)
], ProvisionRequestDto.prototype, "meta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1.0.0',
        description: 'Firmware version of the device',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionRequestDto.prototype, "fwVersion", void 0);
//# sourceMappingURL=provision-request.dto.js.map