"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmissionsModule = void 0;
const common_1 = require("@nestjs/common");
const emissions_service_1 = require("./domain/emissions.service");
const emissions_repository_1 = require("./repositories/emissions.repository");
const emissions_controller_1 = require("./api/emissions.controller");
const thresholds_module_1 = require("../thresholds/thresholds.module");
let EmissionsModule = class EmissionsModule {
};
exports.EmissionsModule = EmissionsModule;
exports.EmissionsModule = EmissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => thresholds_module_1.ThresholdsModule),
        ],
        controllers: [emissions_controller_1.EmissionsController],
        providers: [emissions_service_1.EmissionsService, emissions_repository_1.EmissionsRepository],
        exports: [emissions_service_1.EmissionsService],
    })
], EmissionsModule);
//# sourceMappingURL=emissions.module.js.map