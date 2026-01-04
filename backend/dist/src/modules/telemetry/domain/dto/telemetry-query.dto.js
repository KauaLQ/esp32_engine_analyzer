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
exports.TelemetryMultiSeriesQueryDto = exports.TelemetrySeriesQueryDto = exports.TelemetryQueryDto = exports.FillType = exports.BucketSize = exports.SortOrder = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
var BucketSize;
(function (BucketSize) {
    BucketSize["ONE_MINUTE"] = "1m";
    BucketSize["FIVE_MINUTES"] = "5m";
    BucketSize["FIFTEEN_MINUTES"] = "15m";
    BucketSize["THIRTY_MINUTES"] = "30m";
    BucketSize["ONE_HOUR"] = "1h";
    BucketSize["SIX_HOURS"] = "6h";
    BucketSize["ONE_DAY"] = "1d";
})(BucketSize || (exports.BucketSize = BucketSize = {}));
var FillType;
(function (FillType) {
    FillType["NONE"] = "none";
    FillType["NULL"] = "null";
    FillType["ZERO"] = "zero";
})(FillType || (exports.FillType = FillType = {}));
class TelemetryQueryDto {
    machineId;
    from;
    to;
    limit = 100;
    order = SortOrder.DESC;
}
exports.TelemetryQueryDto = TelemetryQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'Filter by machine ID',
        required: false,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TelemetryQueryDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-12-26T00:00:00.000-03:00',
        description: 'Filter readings from this timestamp',
        required: false,
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TelemetryQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-12-26T23:59:59.999-03:00',
        description: 'Filter readings to this timestamp',
        required: false,
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TelemetryQueryDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 500,
        description: 'Maximum number of readings to return',
        required: false,
        default: 100,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TelemetryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'desc',
        description: 'Sort order',
        required: false,
        enum: SortOrder,
        default: SortOrder.DESC,
    }),
    (0, class_validator_1.IsEnum)(SortOrder),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TelemetryQueryDto.prototype, "order", void 0);
class TelemetrySeriesQueryDto extends TelemetryQueryDto {
    bucket;
    fill = FillType.NONE;
}
exports.TelemetrySeriesQueryDto = TelemetrySeriesQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '15m',
        description: 'Aggregation bucket size (1m, 5m, 15m, 30m, 1h, 6h, 1d)',
        required: false,
        enum: BucketSize,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BucketSize),
    __metadata("design:type", String)
], TelemetrySeriesQueryDto.prototype, "bucket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'null',
        description: 'Gap filling strategy (none, null, zero)',
        required: false,
        enum: FillType,
        default: FillType.NONE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FillType),
    __metadata("design:type", String)
], TelemetrySeriesQueryDto.prototype, "fill", void 0);
class TelemetryMultiSeriesQueryDto extends TelemetrySeriesQueryDto {
    metrics = 'voltage,current,temperature';
}
exports.TelemetryMultiSeriesQueryDto = TelemetryMultiSeriesQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'voltage,current,temperature',
        description: 'Comma-separated list of metrics to include (voltage, current, temperature)',
        required: false,
        default: 'voltage,current,temperature',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TelemetryMultiSeriesQueryDto.prototype, "metrics", void 0);
//# sourceMappingURL=telemetry-query.dto.js.map