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
exports.MachineQueryDto = exports.OrderField = exports.OrderDirection = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const prisma_types_1 = require("../../../../prisma/prisma.types");
var OrderDirection;
(function (OrderDirection) {
    OrderDirection["ASC"] = "asc";
    OrderDirection["DESC"] = "desc";
})(OrderDirection || (exports.OrderDirection = OrderDirection = {}));
var OrderField;
(function (OrderField) {
    OrderField["CREATED_AT"] = "createdAt";
    OrderField["UPDATED_AT"] = "updatedAt";
})(OrderField || (exports.OrderField = OrderField = {}));
class MachineQueryDto {
    search;
    status;
    patioId;
    limit = 50;
    order = OrderDirection.DESC;
    orderBy = OrderField.UPDATED_AT;
}
exports.MachineQueryDto = MachineQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search term for machineKey or name',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachineQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by machine status',
        enum: prisma_types_1.MachineStatus,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(prisma_types_1.MachineStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachineQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by patio ID',
        required: false,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachineQueryDto.prototype, "patioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of results to return',
        default: 50,
        required: false,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MachineQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort direction',
        enum: OrderDirection,
        default: OrderDirection.DESC,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(OrderDirection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachineQueryDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field to sort by',
        enum: OrderField,
        default: OrderField.UPDATED_AT,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(OrderField),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachineQueryDto.prototype, "orderBy", void 0);
//# sourceMappingURL=machine-query.dto.js.map