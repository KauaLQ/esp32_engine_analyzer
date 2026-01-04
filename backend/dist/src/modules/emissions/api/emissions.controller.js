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
exports.EmissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const emissions_service_1 = require("../domain/emissions.service");
const emissions_query_dto_1 = require("../domain/dto/emissions-query.dto");
const emissions_response_dto_1 = require("../domain/dto/emissions-response.dto");
let EmissionsController = class EmissionsController {
    emissionsService;
    constructor(emissionsService) {
        this.emissionsService = emissionsService;
    }
    async getSummary(machineId, query) {
        return this.emissionsService.getSummary(machineId, query);
    }
    async getSeries(machineId, query) {
        return this.emissionsService.getSeries(machineId, query);
    }
};
exports.EmissionsController = EmissionsController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get emissions summary for a machine' }),
    (0, swagger_1.ApiParam)({ name: 'machineId', description: 'Machine ID' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'End date (ISO format)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Emissions summary',
        type: emissions_response_dto_1.EmissionsSummaryResponseDto,
    }),
    __param(0, (0, common_1.Param)('machineId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, emissions_query_dto_1.EmissionsQueryDto]),
    __metadata("design:returntype", Promise)
], EmissionsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('series'),
    (0, swagger_1.ApiOperation)({ summary: 'Get emissions time series for a machine' }),
    (0, swagger_1.ApiParam)({ name: 'machineId', description: 'Machine ID' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'End date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'bucket', required: false, description: 'Time bucket interval (5m, 15m, 1h, 1d)' }),
    (0, swagger_1.ApiQuery)({ name: 'metric', required: false, description: 'Metric to query (power_kw, energy_kwh, kgco2e)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Emissions time series',
        type: emissions_response_dto_1.EmissionsSeriesResponseDto,
    }),
    __param(0, (0, common_1.Param)('machineId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, emissions_query_dto_1.EmissionsSeriesQueryDto]),
    __metadata("design:returntype", Promise)
], EmissionsController.prototype, "getSeries", null);
exports.EmissionsController = EmissionsController = __decorate([
    (0, swagger_1.ApiTags)('emissions'),
    (0, common_1.Controller)('machines/:machineId/emissions'),
    __metadata("design:paramtypes", [emissions_service_1.EmissionsService])
], EmissionsController);
//# sourceMappingURL=emissions.controller.js.map