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
exports.PatiosService = void 0;
const common_1 = require("@nestjs/common");
const patios_repository_1 = require("../repositories/patios.repository");
let PatiosService = class PatiosService {
    patiosRepository;
    constructor(patiosRepository) {
        this.patiosRepository = patiosRepository;
    }
    async create(dto) {
        return this.patiosRepository.create(dto);
    }
    async findAll(query) {
        const result = await this.patiosRepository.findAll(query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                limit: result.limit,
                hasMore: result.hasMore,
            },
        };
    }
    async findPublic() {
        return this.patiosRepository.findPublic();
    }
    async findOne(id) {
        const patio = await this.patiosRepository.findOne(id);
        if (!patio) {
            throw new common_1.NotFoundException(`Patio with ID ${id} not found`);
        }
        return patio;
    }
    async update(id, dto) {
        const patio = await this.patiosRepository.update(id, dto);
        if (!patio) {
            throw new common_1.NotFoundException(`Patio with ID ${id} not found`);
        }
        return patio;
    }
    async delete(id) {
        const result = await this.patiosRepository.delete(id);
        if (result === false) {
            const patio = await this.patiosRepository.findOne(id);
            if (!patio) {
                throw new common_1.NotFoundException(`Patio with ID ${id} not found`);
            }
            throw new common_1.ConflictException(`Cannot delete patio with ID ${id} because it has machines assigned to it`);
        }
    }
    async findMachinesInPatio(patioId, query) {
        const patio = await this.patiosRepository.findOne(patioId);
        if (!patio) {
            throw new common_1.NotFoundException(`Patio with ID ${patioId} not found`);
        }
        const result = await this.patiosRepository.findMachinesInPatio(patioId, query);
        return {
            data: result.data,
            meta: {
                total: result.total,
                limit: result.limit,
                hasMore: result.hasMore,
            },
        };
    }
};
exports.PatiosService = PatiosService;
exports.PatiosService = PatiosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [patios_repository_1.PatiosRepository])
], PatiosService);
//# sourceMappingURL=patios.service.js.map