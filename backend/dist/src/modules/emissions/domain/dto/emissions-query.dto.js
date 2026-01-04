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
exports.EmissionsSeriesQueryDto = exports.EmissionsQueryDto = exports.BucketInterval = exports.EmissionMetric = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var EmissionMetric;
(function (EmissionMetric) {
    EmissionMetric["POWER_KW"] = "power_kw";
    EmissionMetric["ENERGY_KWH"] = "energy_kwh";
    EmissionMetric["KGCO2E"] = "kgco2e";
})(EmissionMetric || (exports.EmissionMetric = EmissionMetric = {}));
var BucketInterval;
(function (BucketInterval) {
    BucketInterval["FIVE_MINUTES"] = "5m";
    BucketInterval["FIFTEEN_MINUTES"] = "15m";
    BucketInterval["ONE_HOUR"] = "1h";
    BucketInterval["ONE_DAY"] = "1d";
})(BucketInterval || (exports.BucketInterval = BucketInterval = {}));
class EmissionsQueryDto {
    from;
    to;
}
exports.EmissionsQueryDto = EmissionsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00Z',
        description: 'Start date for the query (ISO format)',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmissionsQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-02T00:00:00Z',
        description: 'End date for the query (ISO format)',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmissionsQueryDto.prototype, "to", void 0);
class EmissionsSeriesQueryDto extends EmissionsQueryDto {
    bucket = BucketInterval.ONE_HOUR;
    metric = EmissionMetric.KGCO2E;
}
exports.EmissionsSeriesQueryDto = EmissionsSeriesQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: BucketInterval,
        example: BucketInterval.ONE_HOUR,
        description: 'Time bucket interval',
        default: BucketInterval.ONE_HOUR,
    }),
    (0, class_validator_1.IsEnum)(BucketInterval),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmissionsSeriesQueryDto.prototype, "bucket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: EmissionMetric,
        example: EmissionMetric.KGCO2E,
        description: 'Metric to query',
        default: EmissionMetric.KGCO2E,
    }),
    (0, class_validator_1.IsEnum)(EmissionMetric),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmissionsSeriesQueryDto.prototype, "metric", void 0);
//# sourceMappingURL=emissions-query.dto.js.map