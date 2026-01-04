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
exports.PatiosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patios_service_1 = require("../domain/patios.service");
const dto_1 = require("../domain/dto");
const jwt_auth_guard_1 = require("../../auth/domain/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/domain/guards/roles.guard");
const roles_decorator_1 = require("../../auth/domain/decorators/roles.decorator");
let PatiosController = class PatiosController {
    patiosService;
    constructor(patiosService) {
        this.patiosService = patiosService;
    }
    async findPublic() {
        return this.patiosService.findPublic();
    }
    async create(dto) {
        return this.patiosService.create(dto);
    }
    async findAll(query) {
        return this.patiosService.findAll(query);
    }
    async findOne(id) {
        try {
            return await this.patiosService.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException(`Patio with ID ${id} not found`);
        }
    }
    async update(id, dto) {
        return this.patiosService.update(id, dto);
    }
    async delete(id) {
        return this.patiosService.delete(id);
    }
    async findMachinesInPatio(id, query) {
        return this.patiosService.findMachinesInPatio(id, query);
    }
};
exports.PatiosController = PatiosController;
__decorate([
    (0, common_1.Get)('public'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all patios (public endpoint)' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of patios (public data)',
        type: [dto_1.PatioPublicDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "findPublic", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new patio' }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Patio created successfully',
        type: dto_1.PatioDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePatioDto]),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator', 'viewer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all patios with optional filtering' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of patios',
        type: dto_1.PaginatedResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PatioQueryDto]),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator', 'viewer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a patio by ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Patio details',
        type: dto_1.PatioDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Patio not found' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a patio' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Patio updated successfully',
        type: dto_1.PatioDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Patio not found' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePatioDto]),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a patio' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Patio deleted successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Patio not found' }),
    (0, swagger_1.ApiConflictResponse)({ description: 'Cannot delete patio with machines assigned to it' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/machines'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'operator', 'viewer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get machines in a patio' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of machines in the patio',
        type: dto_1.PaginatedResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Patio not found' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.MachinesInPatioQueryDto]),
    __metadata("design:returntype", Promise)
], PatiosController.prototype, "findMachinesInPatio", null);
exports.PatiosController = PatiosController = __decorate([
    (0, swagger_1.ApiTags)('Patios'),
    (0, common_1.Controller)('patios'),
    __metadata("design:paramtypes", [patios_service_1.PatiosService])
], PatiosController);
//# sourceMappingURL=patios.controller.js.map