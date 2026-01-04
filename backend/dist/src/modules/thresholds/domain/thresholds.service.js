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
exports.ThresholdsService = void 0;
const common_1 = require("@nestjs/common");
const thresholds_repository_1 = require("../repositories/thresholds.repository");
const n8n_client_1 = require("../infra/n8n.client");
let ThresholdsService = class ThresholdsService {
    thresholdsRepository;
    n8nClient;
    constructor(thresholdsRepository, n8nClient) {
        this.thresholdsRepository = thresholdsRepository;
        this.n8nClient = n8nClient;
    }
    async createManualProfile(machineId, createDto, userId) {
        const payload = { ...createDto.payload };
        if (createDto.notes) {
            payload.notes = createDto.notes;
        }
        return this.thresholdsRepository.createManualProfile(machineId, payload, userId);
    }
    async createAiProfile(machineId, createDto, userId) {
        const { manufacturer, model } = createDto;
        try {
            const modelLabel = `${manufacturer} ${model}`;
            const query = `${manufacturer} ${model} datasheet filetype:pdf`;
            const aiResponse = await this.n8nClient.validateDevice(manufacturer, model);
            this.validateAiResponse(aiResponse);
            const aiRequest = { model: modelLabel, query };
            return this.thresholdsRepository.createAiProfile(machineId, aiRequest, aiResponse, userId);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadGatewayException(`Failed to create AI threshold profile: ${error.message}`);
            }
            throw new common_1.BadGatewayException('Failed to create AI threshold profile');
        }
    }
    async getActiveProfile(machineId) {
        const profile = await this.thresholdsRepository.findActiveProfile(machineId);
        if (!profile) {
            throw new common_1.NotFoundException(`No active threshold profile found for machine ${machineId}`);
        }
        return profile;
    }
    async getProfileHistory(machineId) {
        return this.thresholdsRepository.findProfileHistory(machineId);
    }
    validateAiResponse(response) {
        if (!response.thresholds) {
            throw new Error('AI response is missing thresholds data');
        }
        const { thresholds } = response;
        if (!thresholds.voltage) {
            throw new Error('AI response is missing voltage thresholds');
        }
        if (!thresholds.current) {
            throw new Error('AI response is missing current thresholds');
        }
        if (!thresholds.temperature_tcase) {
            throw new Error('AI response is missing temperature thresholds');
        }
    }
};
exports.ThresholdsService = ThresholdsService;
exports.ThresholdsService = ThresholdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [thresholds_repository_1.ThresholdsRepository,
        n8n_client_1.N8nClient])
], ThresholdsService);
//# sourceMappingURL=thresholds.service.js.map