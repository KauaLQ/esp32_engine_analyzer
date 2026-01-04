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
exports.ThresholdsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const thresholds_service_1 = require("../domain/thresholds.service");
const dto_1 = require("../domain/dto");
const jwt_auth_guard_1 = require("../../auth/domain/guards/jwt-auth.guard");
let ThresholdsController = class ThresholdsController {
    thresholdsService;
    constructor(thresholdsService) {
        this.thresholdsService = thresholdsService;
    }
    async createManualProfile(machineId, createDto, req) {
        const userId = req.user?.id;
        return this.thresholdsService.createManualProfile(machineId, createDto, userId);
    }
    async createAiProfile(machineId, createDto, req) {
        const userId = req.user?.id;
        return this.thresholdsService.createAiProfile(machineId, createDto, userId);
    }
    async getActiveProfile(machineId) {
        return this.thresholdsService.getActiveProfile(machineId);
    }
    async getProfileHistory(machineId) {
        return this.thresholdsService.getProfileHistory(machineId);
    }
};
exports.ThresholdsController = ThresholdsController;
__decorate([
    (0, common_1.Post)('machines/:machineId/thresholds/manual'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a manual threshold profile' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The threshold profile has been successfully created',
        type: dto_1.ThresholdProfileDto,
    }),
    __param(0, (0, common_1.Param)('machineId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateManualThresholdProfileDto, Object]),
    __metadata("design:returntype", Promise)
], ThresholdsController.prototype, "createManualProfile", null);
__decorate([
    (0, common_1.Post)('machines/:machineId/thresholds/ai'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an AI-based threshold profile' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The threshold profile has been successfully created',
        type: dto_1.ThresholdProfileDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 502,
        description: 'Failed to create AI threshold profile',
    }),
    __param(0, (0, common_1.Param)('machineId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateAiThresholdProfileDto, Object]),
    __metadata("design:returntype", Promise)
], ThresholdsController.prototype, "createAiProfile", null);
__decorate([
    (0, common_1.Get)('machines/:machineId/thresholds'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the active threshold profile for a machine' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The active threshold profile',
        type: dto_1.ThresholdProfileDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No active threshold profile found',
    }),
    __param(0, (0, common_1.Param)('machineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThresholdsController.prototype, "getActiveProfile", null);
__decorate([
    (0, common_1.Get)('machines/:machineId/thresholds/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the threshold profile history for a machine' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The threshold profile history',
        type: [dto_1.ThresholdProfileDto],
    }),
    __param(0, (0, common_1.Param)('machineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThresholdsController.prototype, "getProfileHistory", null);
exports.ThresholdsController = ThresholdsController = __decorate([
    (0, swagger_1.ApiTags)('Thresholds'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [thresholds_service_1.ThresholdsService])
], ThresholdsController);
//# sourceMappingURL=thresholds.controller.js.map