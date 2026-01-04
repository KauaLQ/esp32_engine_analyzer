import { EmissionsRepository } from '../repositories/emissions.repository';
import { ThresholdsRepository } from '../../thresholds/repositories/thresholds.repository';
import { EmissionsQueryDto, EmissionsSeriesQueryDto } from './dto/emissions-query.dto';
import { EmissionsSeriesResponseDto, EmissionsSummaryResponseDto } from './dto/emissions-response.dto';
export declare class EmissionsService {
    private readonly emissionsRepository;
    private readonly thresholdsRepository;
    private readonly logger;
    constructor(emissionsRepository: EmissionsRepository, thresholdsRepository: ThresholdsRepository);
    computeAndPersist(machineId: string, telemetryReadingId: string | number): Promise<void>;
    getSummary(machineId: string, query: EmissionsQueryDto): Promise<EmissionsSummaryResponseDto>;
    getSeries(machineId: string, query: EmissionsSeriesQueryDto): Promise<EmissionsSeriesResponseDto>;
    private getDefaultTimeRange;
}
