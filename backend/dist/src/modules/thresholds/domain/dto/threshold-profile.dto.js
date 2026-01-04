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
exports.ThresholdProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ThresholdProfileDto {
    id;
    machineId;
    mode;
    active;
    version;
    payload;
    aiRequest;
    aiResponse;
    createdAt;
    updatedAt;
}
exports.ThresholdProfileDto = ThresholdProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Threshold profile ID' }),
    __metadata("design:type", String)
], ThresholdProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Machine ID' }),
    __metadata("design:type", String)
], ThresholdProfileDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Threshold mode', enum: ['MANUAL', 'AI_N8N'] }),
    __metadata("design:type", String)
], ThresholdProfileDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the profile is active' }),
    __metadata("design:type", Boolean)
], ThresholdProfileDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile version number' }),
    __metadata("design:type", Number)
], ThresholdProfileDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Threshold profile payload' }),
    __metadata("design:type", Object)
], ThresholdProfileDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI request data' }),
    __metadata("design:type", Object)
], ThresholdProfileDto.prototype, "aiRequest", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI response data' }),
    __metadata("design:type", Object)
], ThresholdProfileDto.prototype, "aiResponse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], ThresholdProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], ThresholdProfileDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=threshold-profile.dto.js.map