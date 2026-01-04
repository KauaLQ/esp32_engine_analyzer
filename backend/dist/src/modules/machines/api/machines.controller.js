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
exports.MachinesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const machines_service_1 = require("../domain/machines.service");
const provision_request_dto_1 = require("../domain/dto/provision-request.dto");
const provision_response_dto_1 = require("../domain/dto/provision-response.dto");
const machine_dto_1 = require("../domain/dto/machine.dto");
const machine_query_dto_1 = require("../domain/dto/machine-query.dto");
const update_machine_dto_1 = require("../domain/dto/update-machine.dto");
const paginated_response_dto_1 = require("../domain/dto/paginated-response.dto");
const config_1 = require("@nestjs/config");
const roles_guard_1 = require("../../auth/domain/guards/roles.guard");
const jwt_auth_guard_1 = require("../../auth/domain/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/domain/decorators/roles.decorator");
let MachinesController = class MachinesController {
    machinesService;
    configService;
    constructor(machinesService, configService) {
        this.machinesService = machinesService;
        this.configService = configService;
    }
    async provision(provisionToken, dto) {
        const configToken = this.configService.get('PROVISIONING_TOKEN');
        if (!configToken) {
            throw new common_1.UnauthorizedException('Provisioning token not configured');
        }
        if (provisionToken !== configToken) {
            throw new common_1.UnauthorizedException('Invalid provisioning token');
        }
        return this.machinesService.provision(dto);
    }
    async findAll(query) {
        return this.machinesService.findAll(query);
    }
    async findOne(id) {
        try {
            return await this.machinesService.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException(`Machine with ID ${id} not found`);
        }
    }
    async update(id, dto) {
        return this.machinesService.update(id, dto);
    }
    async delete(id) {
        const success = await this.machinesService.delete(id);
        return { success };
    }
};
exports.MachinesController = MachinesController;
__decorate([
    (0, common_1.Post)('provision'),
    (0, swagger_1.ApiOperation)({ summary: 'Provision a device and associate it with a machine' }),
    (0, swagger_1.ApiHeader)({
        name: 'x-provision-token',
        description: 'Provisioning token for authentication',
        required: true,
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Device provisioned successfully',
        type: provision_response_dto_1.ProvisionResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid provisioning token' }),
    (0, swagger_1.ApiConflictResponse)({ description: 'Device or machine already paired with another entity' }),
    __param(0, (0, common_1.Headers)('x-provision-token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, provision_request_dto_1.ProvisionRequestDto]),
    __metadata("design:returntype", Promise)
], MachinesController.prototype, "provision", null);
__decorate([
    (0, common_1.Get)('machines'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator', 'viewer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all machines with optional filtering' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of machines',
        type: paginated_response_dto_1.PaginatedResponseDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [machine_query_dto_1.MachineQueryDto]),
    __metadata("design:returntype", Promise)
], MachinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('machines/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator', 'viewer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a machine by ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Machine details',
        type: machine_dto_1.MachineDetailDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Machine not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MachinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('machines/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a machine' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Machine updated successfully',
        type: machine_dto_1.MachineDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Machine not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_machine_dto_1.UpdateMachineDto]),
    __metadata("design:returntype", Promise)
], MachinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('machines/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a machine and all related data' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Machine deleted successfully',
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Machine not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MachinesController.prototype, "delete", null);
exports.MachinesController = MachinesController = __decorate([
    (0, swagger_1.ApiTags)('Machines'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [machines_service_1.MachinesService,
        config_1.ConfigService])
], MachinesController);
//# sourceMappingURL=machines.controller.js.map