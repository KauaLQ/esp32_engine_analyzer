import { ThresholdsService } from '../domain/thresholds.service';
import { CreateAiThresholdProfileDto, CreateManualThresholdProfileDto, ThresholdProfileDto } from '../domain/dto';
export declare class ThresholdsController {
    private readonly thresholdsService;
    constructor(thresholdsService: ThresholdsService);
    createManualProfile(machineId: string, createDto: CreateManualThresholdProfileDto, req: any): Promise<ThresholdProfileDto>;
    createAiProfile(machineId: string, createDto: CreateAiThresholdProfileDto, req: any): Promise<ThresholdProfileDto>;
    getActiveProfile(machineId: string): Promise<ThresholdProfileDto>;
    getProfileHistory(machineId: string): Promise<ThresholdProfileDto[]>;
}
