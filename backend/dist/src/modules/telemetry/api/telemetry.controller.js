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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const telemetry_service_1 = require("../domain/telemetry.service");
const create_telemetry_dto_1 = require("../domain/dto/create-telemetry.dto");
const telemetry_query_dto_1 = require("../domain/dto/telemetry-query.dto");
const telemetry_response_dto_1 = require("../domain/dto/telemetry-response.dto");
let TelemetryController = class TelemetryController {
    telemetryService;
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
    }
    async create(createTelemetryDto) {
        return this.telemetryService.create(createTelemetryDto);
    }
    async findAll(query) {
        return this.telemetryService.findAll(query);
    }
    async findLatest(machineId) {
        return this.telemetryService.findLatest(machineId);
    }
    async findSeries(metric, query) {
        return this.telemetryService.findSeries(metric, query);
    }
    async findMultiSeries(query) {
        return this.telemetryService.findMultiSeries(query);
    }
    async delete(id) {
        return this.telemetryService.delete(id);
    }
};
exports.TelemetryController = TelemetryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new telemetry reading' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Telemetry reading created successfully',
        type: telemetry_response_dto_1.TelemetryReadingDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_telemetry_dto_1.CreateTelemetryDto]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all telemetry readings with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Telemetry readings retrieved successfully',
        type: telemetry_response_dto_1.TelemetryReadingsResponseDto
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telemetry_query_dto_1.TelemetryQueryDto]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('machine/:machineId/latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the latest telemetry reading for a specific machine' }),
    (0, swagger_1.ApiParam)({ name: 'machineId', description: 'The ID of the machine' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Latest telemetry reading retrieved successfully',
        type: telemetry_response_dto_1.TelemetryReadingDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No telemetry readings found for the machine' }),
    __param(0, (0, common_1.Param)('machineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('series'),
    (0, swagger_1.ApiOperation)({ summary: 'Get time series data for a specific metric' }),
    (0, swagger_1.ApiQuery)({
        name: 'metric',
        description: 'The metric to get time series data for',
        enum: ['voltage', 'current', 'temperature'],
        required: true
    }),
    (0, swagger_1.ApiQuery)({
        name: 'machineId',
        description: 'The ID of the machine',
        type: String,
        required: true
    }),
    (0, swagger_1.ApiQuery)({
        name: 'from',
        description: 'Start timestamp (ISO8601)',
        type: String,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'to',
        description: 'End timestamp (ISO8601)',
        type: String,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'bucket',
        description: 'Aggregation bucket size',
        enum: telemetry_query_dto_1.BucketSize,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'fill',
        description: 'Gap filling strategy',
        enum: telemetry_query_dto_1.FillType,
        required: false,
        default: telemetry_query_dto_1.FillType.NONE
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Maximum number of points to return (only when bucket is not specified)',
        type: Number,
        required: false
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Time series data retrieved successfully',
        type: telemetry_response_dto_1.TelemetrySeriesResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Query)('metric')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, telemetry_query_dto_1.TelemetrySeriesQueryDto]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "findSeries", null);
__decorate([
    (0, common_1.Get)('series/multi'),
    (0, swagger_1.ApiOperation)({ summary: 'Get time series data for multiple metrics' }),
    (0, swagger_1.ApiQuery)({
        name: 'machineId',
        description: 'The ID of the machine',
        type: String,
        required: true
    }),
    (0, swagger_1.ApiQuery)({
        name: 'metrics',
        description: 'Comma-separated list of metrics to include (voltage, current, temperature)',
        type: String,
        required: false,
        default: 'voltage,current,temperature'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'from',
        description: 'Start timestamp (ISO8601)',
        type: String,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'to',
        description: 'End timestamp (ISO8601)',
        type: String,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'bucket',
        description: 'Aggregation bucket size',
        enum: telemetry_query_dto_1.BucketSize,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'fill',
        description: 'Gap filling strategy',
        enum: telemetry_query_dto_1.FillType,
        required: false,
        default: telemetry_query_dto_1.FillType.NONE
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Multi-metric time series data retrieved successfully',
        type: telemetry_response_dto_1.TelemetryMultiSeriesResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telemetry_query_dto_1.TelemetryMultiSeriesQueryDto]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "findMultiSeries", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a telemetry reading' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The ID of the telemetry reading to delete' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Telemetry reading deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Telemetry reading not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "delete", null);
exports.TelemetryController = TelemetryController = __decorate([
    (0, swagger_1.ApiTags)('Telemetry'),
    (0, common_1.Controller)('telemetry'),
    __metadata("design:paramtypes", [telemetry_service_1.TelemetryService])
], TelemetryController);
//# sourceMappingURL=telemetry.controller.js.map