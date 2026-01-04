import { PrismaService } from '../../../prisma/prisma.service';
import { ThresholdProfileDto } from '../domain/dto';
export declare class ThresholdsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createManualProfile(machineId: string, payload: Record<string, any>, userId?: string): Promise<ThresholdProfileDto>;
    createAiProfile(machineId: string, aiRequest: Record<string, any>, aiResponse: Record<string, any>, userId?: string): Promise<ThresholdProfileDto>;
    findActiveProfile(machineId: string): Promise<ThresholdProfileDto | null>;
    findProfileHistory(machineId: string): Promise<ThresholdProfileDto[]>;
    private mapToThresholdProfileDto;
}
