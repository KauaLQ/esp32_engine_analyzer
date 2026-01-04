"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const thresholds_controller_1 = require("./api/thresholds.controller");
const thresholds_service_1 = require("./domain/thresholds.service");
const thresholds_repository_1 = require("./repositories/thresholds.repository");
const n8n_client_1 = require("./infra/n8n.client");
const threshold_evaluation_service_1 = require("./domain/threshold-evaluation.service");
const alarms_module_1 = require("../alarms/alarms.module");
let ThresholdsModule = class ThresholdsModule {
};
exports.ThresholdsModule = ThresholdsModule;
exports.ThresholdsModule = ThresholdsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, alarms_module_1.AlarmsModule],
        controllers: [thresholds_controller_1.ThresholdsController],
        providers: [
            thresholds_service_1.ThresholdsService,
            thresholds_repository_1.ThresholdsRepository,
            n8n_client_1.N8nClient,
            threshold_evaluation_service_1.ThresholdEvaluationService,
        ],
        exports: [
            thresholds_service_1.ThresholdsService,
            threshold_evaluation_service_1.ThresholdEvaluationService,
            thresholds_repository_1.ThresholdsRepository,
        ],
    })
], ThresholdsModule);
//# sourceMappingURL=thresholds.module.js.map