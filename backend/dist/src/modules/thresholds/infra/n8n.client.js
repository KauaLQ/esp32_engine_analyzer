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
exports.N8nClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let N8nClient = class N8nClient {
    configService;
    client;
    validateDeviceUrl;
    timeout;
    constructor(configService) {
        this.configService = configService;
        this.validateDeviceUrl = this.configService.get('N8N_VALIDATE_DEVICE_URL') ?? "";
        this.timeout = this.configService.get('N8N_TIMEOUT_MS', 10000);
        this.client = axios_1.default.create({
            timeout: this.timeout,
        });
    }
    async validateDevice(manufacturer, model) {
        const modelLabel = `${manufacturer} ${model}`;
        const query = `${manufacturer} ${model} datasheet filetype:pdf`;
        console.log("Tentando realizar a pesquisa");
        const request = {
            model: modelLabel,
            query,
        };
        try {
            const response = await this.client.post(this.validateDeviceUrl, request);
            console.log(response.data);
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const status = error.response?.status || 502;
                const message = error.response?.data?.message || error.message;
                throw new Error(`N8N request failed with status ${status}: ${message}`);
            }
            throw error;
        }
    }
};
exports.N8nClient = N8nClient;
exports.N8nClient = N8nClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], N8nClient);
//# sourceMappingURL=n8n.client.js.map