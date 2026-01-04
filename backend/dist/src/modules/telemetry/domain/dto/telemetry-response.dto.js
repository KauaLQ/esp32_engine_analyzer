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
exports.TelemetryMultiSeriesResponseDto = exports.TelemetryMultiSeriesPointDto = exports.TelemetryMultiSeriesValuesDto = exports.TelemetrySeriesResponseDto = exports.TelemetrySeriesPointDto = exports.TelemetryReadingsResponseDto = exports.PaginatedResponseDto = exports.TelemetryReadingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TelemetryReadingDto {
    id;
    machineId;
    ts;
    voltageV;
    currentA;
    temperatureC;
    seq;
}
exports.TelemetryReadingDto = TelemetryReadingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123',
        description: 'The ID of the telemetry reading',
    }),
    __metadata("design:type", String)
], TelemetryReadingDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
        description: 'The ID of the machine',
    }),
    __metadata("design:type", String)
], TelemetryReadingDto.prototype, "machineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-12-26T11:40:10.000-03:00',
        description: 'The timestamp of the telemetry reading',
    }),
    __metadata("design:type", String)
], TelemetryReadingDto.prototype, "ts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 221.7,
        description: 'The voltage in volts',
    }),
    __metadata("design:type", Number)
], TelemetryReadingDto.prototype, "voltageV", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12.4,
        description: 'The current in amperes',
    }),
    __metadata("design:type", Number)
], TelemetryReadingDto.prototype, "currentA", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 49.2,
        description: 'The temperature in Celsius',
    }),
    __metadata("design:type", Number)
], TelemetryReadingDto.prototype, "temperatureC", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'The sequence number',
    }),
    __metadata("design:type", Number)
], TelemetryReadingDto.prototype, "seq", void 0);
class PaginatedResponseDto {
    data;
    meta;
}
exports.PaginatedResponseDto = PaginatedResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The data returned by the query',
        isArray: true,
    }),
    __metadata("design:type", Array)
], PaginatedResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Metadata about the response',
        example: {
            total: 150,
            page: 1,
            limit: 100,
            hasMore: true,
        },
    }),
    __metadata("design:type", Object)
], PaginatedResponseDto.prototype, "meta", void 0);
class TelemetryReadingsResponseDto extends PaginatedResponseDto {
}
exports.TelemetryReadingsResponseDto = TelemetryReadingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The telemetry readings',
        type: [TelemetryReadingDto],
    }),
    __metadata("design:type", Array)
], TelemetryReadingsResponseDto.prototype, "data", void 0);
class TelemetrySeriesPointDto {
    ts;
    value;
}
exports.TelemetrySeriesPointDto = TelemetrySeriesPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-12-26T11:40:00.000-03:00',
        description: 'The timestamp of the data point',
    }),
    __metadata("design:type", String)
], TelemetrySeriesPointDto.prototype, "ts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 221.7,
        description: 'The value of the data point',
        nullable: true,
    }),
    __metadata("design:type", Object)
], TelemetrySeriesPointDto.prototype, "value", void 0);
class TelemetrySeriesResponseDto extends PaginatedResponseDto {
}
exports.TelemetrySeriesResponseDto = TelemetrySeriesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The series data points',
        type: [TelemetrySeriesPointDto],
    }),
    __metadata("design:type", Array)
], TelemetrySeriesResponseDto.prototype, "data", void 0);
class TelemetryMultiSeriesValuesDto {
    voltageV;
    currentA;
    temperatureC;
}
exports.TelemetryMultiSeriesValuesDto = TelemetryMultiSeriesValuesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 221.7,
        description: 'The voltage value in volts',
        nullable: true,
        required: false,
    }),
    __metadata("design:type", Object)
], TelemetryMultiSeriesValuesDto.prototype, "voltageV", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12.4,
        description: 'The current value in amperes',
        nullable: true,
        required: false,
    }),
    __metadata("design:type", Object)
], TelemetryMultiSeriesValuesDto.prototype, "currentA", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 49.2,
        description: 'The temperature value in Celsius',
        nullable: true,
        required: false,
    }),
    __metadata("design:type", Object)
], TelemetryMultiSeriesValuesDto.prototype, "temperatureC", void 0);
class TelemetryMultiSeriesPointDto {
    ts;
    values;
}
exports.TelemetryMultiSeriesPointDto = TelemetryMultiSeriesPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-12-26T11:40:00.000-03:00',
        description: 'The timestamp of the data point',
    }),
    __metadata("design:type", String)
], TelemetryMultiSeriesPointDto.prototype, "ts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The values of the data point for each metric',
        type: TelemetryMultiSeriesValuesDto,
    }),
    __metadata("design:type", TelemetryMultiSeriesValuesDto)
], TelemetryMultiSeriesPointDto.prototype, "values", void 0);
class TelemetryMultiSeriesResponseDto extends PaginatedResponseDto {
}
exports.TelemetryMultiSeriesResponseDto = TelemetryMultiSeriesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The multi-series data points',
        type: [TelemetryMultiSeriesPointDto],
    }),
    __metadata("design:type", Array)
], TelemetryMultiSeriesResponseDto.prototype, "data", void 0);
//# sourceMappingURL=telemetry-response.dto.js.map