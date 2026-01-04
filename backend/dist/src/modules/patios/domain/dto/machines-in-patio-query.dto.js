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
exports.MachinesInPatioQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const patio_query_dto_1 = require("./patio-query.dto");
const prisma_types_1 = require("../../../../prisma/prisma.types");
class MachinesInPatioQueryDto {
    search;
    status;
    limit = 50;
    order = patio_query_dto_1.OrderDirection.DESC;
}
exports.MachinesInPatioQueryDto = MachinesInPatioQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search term to filter machines by machine_key or name',
        example: 'machine-001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachinesInPatioQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter machines by status',
        enum: prisma_types_1.MachineStatus,
    }),
    (0, class_validator_1.IsEnum)(prisma_types_1.MachineStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachinesInPatioQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of machines to return',
        example: 50,
        default: 50,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MachinesInPatioQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order for results',
        enum: patio_query_dto_1.OrderDirection,
        default: patio_query_dto_1.OrderDirection.DESC,
    }),
    (0, class_validator_1.IsEnum)(patio_query_dto_1.OrderDirection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MachinesInPatioQueryDto.prototype, "order", void 0);
//# sourceMappingURL=machines-in-patio-query.dto.js.map