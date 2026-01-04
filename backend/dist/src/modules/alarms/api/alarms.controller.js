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
exports.AlarmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alarms_service_1 = require("../domain/alarms.service");
const dto_1 = require("../domain/dto");
const jwt_auth_guard_1 = require("../../auth/domain/guards/jwt-auth.guard");
let AlarmsController = class AlarmsController {
    alarmsService;
    constructor(alarmsService) {
        this.alarmsService = alarmsService;
    }
    async findAll(query) {
        return this.alarmsService.findAll(query);
    }
    async findOne(id) {
        return this.alarmsService.findById(id);
    }
    async create(createDto, req) {
        const userId = req.user?.id;
        return this.alarmsService.create(createDto, userId);
    }
    async acknowledge(id, req) {
        const userId = req.user?.id;
        return this.alarmsService.acknowledge(id, userId);
    }
    async close(id, req) {
        const userId = req.user?.id;
        return this.alarmsService.close(id, userId);
    }
    async delete(id) {
        return this.alarmsService.delete(id);
    }
};
exports.AlarmsController = AlarmsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all alarms with filtering' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of alarms',
        type: () => dto_1.PaginatedResponseDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AlarmQueryDto]),
    __metadata("design:returntype", Promise)
], AlarmsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific alarm by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The alarm',
        type: dto_1.AlarmDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Alarm not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AlarmsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new alarm manually' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The alarm has been successfully created',
        type: dto_1.AlarmDto,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAlarmDto, Object]),
    __metadata("design:returntype", Promise)
], AlarmsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/ack'),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge an alarm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The alarm has been acknowledged',
        type: dto_1.AlarmDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Alarm not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlarmsController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close an alarm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The alarm has been closed',
        type: dto_1.AlarmDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Alarm not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlarmsController.prototype, "close", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an alarm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The alarm has been deleted',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Alarm not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AlarmsController.prototype, "delete", null);
exports.AlarmsController = AlarmsController = __decorate([
    (0, swagger_1.ApiTags)('Alarms'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('alarms'),
    __metadata("design:paramtypes", [alarms_service_1.AlarmsService])
], AlarmsController);
//# sourceMappingURL=alarms.controller.js.map