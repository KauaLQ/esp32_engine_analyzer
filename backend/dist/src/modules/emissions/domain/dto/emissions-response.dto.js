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
exports.EmissionsSummaryResponseDto = exports.EmissionsSeriesResponseDto = exports.EmissionsSeriesPointDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const emissions_query_dto_1 = require("./emissions-query.dto");
class EmissionsSeriesPointDto {
    ts;
    value;
}
exports.EmissionsSeriesPointDto = EmissionsSeriesPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00Z',
        description: 'Timestamp for the data point',
    }),
    __metadata("design:type", String)
], EmissionsSeriesPointDto.prototype, "ts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2.5,
        description: 'Value for the data point',
    }),
    __metadata("design:type", Number)
], EmissionsSeriesPointDto.prototype, "value", void 0);
class EmissionsSeriesResponseDto {
    machineId;
    metric;
    bucket;
    from;
    to;
    points;
}
exports.EmissionsSeriesResponseDto = EmissionsSeriesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'Machine ID',
    }),
    __metadata("design:type", String)
], EmissionsSeriesResponseDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: emissions_query_dto_1.EmissionMetric,
        example: emissions_query_dto_1.EmissionMetric.KGCO2E,
        description: 'Metric being queried',
    }),
    __metadata("design:type", String)
], EmissionsSeriesResponseDto.prototype, "metric", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: emissions_query_dto_1.BucketInterval,
        example: emissions_query_dto_1.BucketInterval.ONE_HOUR,
        description: 'Time bucket interval',
    }),
    __metadata("design:type", String)
], EmissionsSeriesResponseDto.prototype, "bucket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00Z',
        description: 'Start date of the query range',
    }),
    __metadata("design:type", String)
], EmissionsSeriesResponseDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-02T00:00:00Z',
        description: 'End date of the query range',
    }),
    __metadata("design:type", String)
], EmissionsSeriesResponseDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [EmissionsSeriesPointDto],
        description: 'Series data points',
    }),
    __metadata("design:type", Array)
], EmissionsSeriesResponseDto.prototype, "points", void 0);
class EmissionsSummaryResponseDto {
    machineId;
    from;
    to;
    energyKwhTotal;
    kgco2eTotal;
    factorUsed;
    pointsCount;
}
exports.EmissionsSummaryResponseDto = EmissionsSummaryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'Machine ID',
    }),
    __metadata("design:type", String)
], EmissionsSummaryResponseDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00Z',
        description: 'Start date of the query range',
    }),
    __metadata("design:type", String)
], EmissionsSummaryResponseDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-02T00:00:00Z',
        description: 'End date of the query range',
    }),
    __metadata("design:type", String)
], EmissionsSummaryResponseDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 24.5,
        description: 'Total energy consumption in kWh',
    }),
    __metadata("design:type", Number)
], EmissionsSummaryResponseDto.prototype, "energyKwhTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12.25,
        description: 'Total CO2 emissions in kgCO2e',
    }),
    __metadata("design:type", Number)
], EmissionsSummaryResponseDto.prototype, "kgco2eTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0.5,
        description: 'Emission factor used for calculations (kgCO2e per kWh)',
        nullable: true,
    }),
    __metadata("design:type", Object)
], EmissionsSummaryResponseDto.prototype, "factorUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 24,
        description: 'Number of data points in the query range',
    }),
    __metadata("design:type", Number)
], EmissionsSummaryResponseDto.prototype, "pointsCount", void 0);
//# sourceMappingURL=emissions-response.dto.js.map