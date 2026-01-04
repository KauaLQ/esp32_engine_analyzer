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
exports.ThresholdsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ThresholdsRepository = class ThresholdsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createManualProfile(machineId, payload, userId) {
        return this.prisma.$transaction(async (tx) => {
            const latestProfile = await tx.machine_threshold_profiles.findFirst({
                where: { machine_id: machineId },
                orderBy: { version: 'desc' },
                select: { version: true },
            });
            const nextVersion = latestProfile ? latestProfile.version + 1 : 1;
            await tx.machine_threshold_profiles.updateMany({
                where: { machine_id: machineId, active: true },
                data: { active: false },
            });
            const newProfile = await tx.machine_threshold_profiles.create({
                data: {
                    machine_id: machineId,
                    mode: 'MANUAL',
                    active: true,
                    version: nextVersion,
                    payload,
                    created_by: userId,
                },
            });
            return this.mapToThresholdProfileDto(newProfile);
        });
    }
    async createAiProfile(machineId, aiRequest, aiResponse, userId) {
        return this.prisma.$transaction(async (tx) => {
            const latestProfile = await tx.machine_threshold_profiles.findFirst({
                where: { machine_id: machineId },
                orderBy: { version: 'desc' },
                select: { version: true },
            });
            const nextVersion = latestProfile ? latestProfile.version + 1 : 1;
            await tx.machine_threshold_profiles.updateMany({
                where: { machine_id: machineId, active: true },
                data: { active: false },
            });
            const newProfile = await tx.machine_threshold_profiles.create({
                data: {
                    machine_id: machineId,
                    mode: 'AI_N8N',
                    active: true,
                    version: nextVersion,
                    payload: aiResponse,
                    ai_request: aiRequest,
                    ai_response: aiResponse,
                    created_by: userId,
                },
            });
            return this.mapToThresholdProfileDto(newProfile);
        });
    }
    async findActiveProfile(machineId) {
        const profile = await this.prisma.machine_threshold_profiles.findFirst({
            where: {
                machine_id: machineId,
                active: true,
            },
        });
        return profile ? this.mapToThresholdProfileDto(profile) : null;
    }
    async findProfileHistory(machineId) {
        const profiles = await this.prisma.machine_threshold_profiles.findMany({
            where: {
                machine_id: machineId,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return profiles.map(this.mapToThresholdProfileDto);
    }
    mapToThresholdProfileDto(profile) {
        return {
            id: profile.id,
            machineId: profile.machine_id,
            mode: profile.mode,
            active: profile.active,
            version: profile.version,
            payload: profile.payload,
            aiRequest: profile.ai_request,
            aiResponse: profile.ai_response,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
        };
    }
};
exports.ThresholdsRepository = ThresholdsRepository;
exports.ThresholdsRepository = ThresholdsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ThresholdsRepository);
//# sourceMappingURL=thresholds.repository.js.map