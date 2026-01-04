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
exports.PatioDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PatioDto {
    id;
    name;
    address;
    createdAt;
    updatedAt;
}
exports.PatioDto = PatioDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The unique identifier of the patio',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], PatioDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the patio',
        example: 'Pátio A',
    }),
    __metadata("design:type", String)
], PatioDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The address of the patio',
        example: 'Rua X, 123',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PatioDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date and time when the patio was created',
        example: '2023-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], PatioDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date and time when the patio was last updated',
        example: '2023-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], PatioDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=patio.dto.js.map