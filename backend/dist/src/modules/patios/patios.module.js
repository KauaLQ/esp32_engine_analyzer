"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatiosModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const patios_controller_1 = require("./api/patios.controller");
const patios_service_1 = require("./domain/patios.service");
const patios_repository_1 = require("./repositories/patios.repository");
let PatiosModule = class PatiosModule {
};
exports.PatiosModule = PatiosModule;
exports.PatiosModule = PatiosModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [patios_controller_1.PatiosController],
        providers: [patios_service_1.PatiosService, patios_repository_1.PatiosRepository],
        exports: [patios_service_1.PatiosService],
    })
], PatiosModule);
//# sourceMappingURL=patios.module.js.map