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
exports.UpdateMachineDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const provision_request_dto_1 = require("./provision-request.dto");
const prisma_types_1 = require("../../../../prisma/prisma.types");
class UpdateMachineDto {
    status;
    operatorUserId;
    manufacturer;
    model;
    patioId;
    meta;
}
exports.UpdateMachineDto = UpdateMachineDto;
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
], UpdateMachineDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '7b09b75a-e013-4d63-a9b6-2bcecd48b4ee',
        description: 'ID of the operator user',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateMachineDto.prototype, "operatorUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'WEG',
        description: 'Manufacturer of the machine',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMachineDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'W22',
        description: 'Model of the machine',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMachineDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f',
        description: 'ID of the patio where the machine is located',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateMachineDto.prototype, "patioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: provision_request_dto_1.MetaDto,
        description: 'Additional metadata for the machine',
        required: false,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => provision_request_dto_1.MetaDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateMachineDto.prototype, "meta", void 0);
//# sourceMappingURL=update-machine.dto.js.map