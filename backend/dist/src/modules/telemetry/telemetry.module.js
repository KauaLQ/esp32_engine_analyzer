"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const machines_module_1 = require("../machines/machines.module");
const thresholds_module_1 = require("../thresholds/thresholds.module");
const alarms_module_1 = require("../alarms/alarms.module");
const emissions_module_1 = require("../emissions/emissions.module");
const telemetry_controller_1 = require("./api/telemetry.controller");
const telemetry_service_1 = require("./domain/telemetry.service");
const telemetry_repository_1 = require("./repositories/telemetry.repository");
const alarms_evaluator_service_1 = require("../alarms/domain/alarms-evaluator.service");
let TelemetryModule = class TelemetryModule {
};
exports.TelemetryModule = TelemetryModule;
exports.TelemetryModule = TelemetryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            machines_module_1.MachinesModule,
            thresholds_module_1.ThresholdsModule,
            alarms_module_1.AlarmsModule,
            (0, common_1.forwardRef)(() => emissions_module_1.EmissionsModule),
        ],
        controllers: [telemetry_controller_1.TelemetryController],
        providers: [telemetry_service_1.TelemetryService, telemetry_repository_1.TelemetryRepository, alarms_evaluator_service_1.AlarmsEvaluatorService],
    })
], TelemetryModule);
//# sourceMappingURL=telemetry.module.js.map