import { EmissionsService } from '../domain/emissions.service';
import { EmissionsQueryDto, EmissionsSeriesQueryDto } from '../domain/dto/emissions-query.dto';
import { EmissionsSeriesResponseDto, EmissionsSummaryResponseDto } from '../domain/dto/emissions-response.dto';
export declare class EmissionsController {
    private readonly emissionsService;
    constructor(emissionsService: EmissionsService);
    getSummary(machineId: string, query: EmissionsQueryDto): Promise<EmissionsSummaryResponseDto>;
    getSeries(machineId: string, query: EmissionsSeriesQueryDto): Promise<EmissionsSeriesResponseDto>;
}
