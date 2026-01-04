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
exports.CreateManualThresholdProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateManualThresholdProfileDto {
    payload;
    notes;
}
exports.CreateManualThresholdProfileDto = CreateManualThresholdProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        additionalProperties: true,
        description: 'Threshold profile payload',
        type: 'object',
        example: {
            regime: {},
            nominais: {},
            thresholds: {
                voltage: {
                    warn_low_v: 414,
                    crit_low_v: 391,
                    warn_high_v: 506,
                    crit_high_v: 531,
                    hard_min_v: 391,
                    hard_max_v: 531
                },
                current: {
                    warn_high_a: 6.82,
                    crit_high_a: 7.75,
                    hard_max_a: 8.37
                },
                temperature_tcase: {
                    warn_high_c: 100,
                    crit_high_c: 110,
                    hard_max_c: 120
                }
            }
        }
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateManualThresholdProfileDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional notes about the threshold profile',
        type: [String],
        example: ['Manual threshold profile created by admin']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateManualThresholdProfileDto.prototype, "notes", void 0);
//# sourceMappingURL=create-manual-threshold-profile.dto.js.map