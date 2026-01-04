import { ThresholdsRepository } from '../repositories/thresholds.repository';
import { N8nClient } from '../infra/n8n.client';
import { CreateAiThresholdProfileDto, CreateManualThresholdProfileDto, ThresholdProfileDto } from './dto';
export declare class ThresholdsService {
    private readonly thresholdsRepository;
    private readonly n8nClient;
    constructor(thresholdsRepository: ThresholdsRepository, n8nClient: N8nClient);
    createManualProfile(machineId: string, createDto: CreateManualThresholdProfileDto, userId?: string): Promise<ThresholdProfileDto>;
    createAiProfile(machineId: string, createDto: CreateAiThresholdProfileDto, userId?: string): Promise<ThresholdProfileDto>;
    getActiveProfile(machineId: string): Promise<ThresholdProfileDto>;
    getProfileHistory(machineId: string): Promise<ThresholdProfileDto[]>;
    private validateAiResponse;
}
