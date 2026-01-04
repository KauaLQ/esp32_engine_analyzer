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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/domain/guards/jwt-auth.guard");
const dashboard_service_1 = require("../domain/dashboard.service");
const dashboard_metrics_dto_1 = require("../domain/dto/dashboard-metrics.dto");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getMetrics(query) {
        return this.dashboardService.getDashboardMetrics(query.from, query.to);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get global dashboard metrics' }),
    (0, swagger_1.ApiQuery)({
        name: 'from',
        required: false,
        description: 'Start timestamp (ISO8601). Default: 30 days ago',
        type: String,
        example: '2023-01-01T00:00:00.000Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'to',
        required: false,
        description: 'End timestamp (ISO8601). Default: now',
        type: String,
        example: '2023-01-31T23:59:59.999Z',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Global dashboard metrics retrieved successfully',
        type: dashboard_metrics_dto_1.DashboardMetricsResponseDto
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_metrics_dto_1.DashboardMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMetrics", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map