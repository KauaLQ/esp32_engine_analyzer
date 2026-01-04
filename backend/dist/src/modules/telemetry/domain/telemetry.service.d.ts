import { TelemetryRepository } from '../repositories/telemetry.repository';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { TelemetryMultiSeriesQueryDto, TelemetryQueryDto, TelemetrySeriesQueryDto } from './dto/telemetry-query.dto';
import { PaginatedResponseDto, TelemetryMultiSeriesPointDto, TelemetryReadingDto, TelemetrySeriesPointDto } from './dto/telemetry-response.dto';
import { MachinesService } from '../../machines/domain/machines.service';
import { AlarmsEvaluatorService } from '../../alarms/domain/alarms-evaluator.service';
import { EmissionsService } from '../../emissions/domain/emissions.service';
export declare class TelemetryService {
    private readonly telemetryRepository;
    private readonly machinesService;
    private readonly alarmsEvaluatorService;
    private readonly emissionsService;
    constructor(telemetryRepository: TelemetryRepository, machinesService: MachinesService, alarmsEvaluatorService: AlarmsEvaluatorService, emissionsService: EmissionsService);
    create(createTelemetryDto: CreateTelemetryDto): Promise<TelemetryReadingDto>;
    findAll(query: TelemetryQueryDto): Promise<PaginatedResponseDto<TelemetryReadingDto>>;
    findLatest(machineId: string): Promise<TelemetryReadingDto>;
    findSeries(metric: 'voltage' | 'current' | 'temperature', query: TelemetrySeriesQueryDto): Promise<PaginatedResponseDto<TelemetrySeriesPointDto>>;
    findMultiSeries(query: TelemetryMultiSeriesQueryDto): Promise<PaginatedResponseDto<TelemetryMultiSeriesPointDto>>;
    delete(id: string): Promise<void>;
}
