import { TelemetryService } from '../domain/telemetry.service';
import { CreateTelemetryDto } from '../domain/dto/create-telemetry.dto';
import { TelemetryMultiSeriesQueryDto, TelemetryQueryDto, TelemetrySeriesQueryDto } from '../domain/dto/telemetry-query.dto';
import { PaginatedResponseDto, TelemetryMultiSeriesPointDto, TelemetryReadingDto, TelemetrySeriesPointDto } from '../domain/dto/telemetry-response.dto';
export declare class TelemetryController {
    private readonly telemetryService;
    constructor(telemetryService: TelemetryService);
    create(createTelemetryDto: CreateTelemetryDto): Promise<TelemetryReadingDto>;
    findAll(query: TelemetryQueryDto): Promise<PaginatedResponseDto<TelemetryReadingDto>>;
    findLatest(machineId: string): Promise<TelemetryReadingDto>;
    findSeries(metric: 'voltage' | 'current' | 'temperature', query: TelemetrySeriesQueryDto): Promise<PaginatedResponseDto<TelemetrySeriesPointDto>>;
    findMultiSeries(query: TelemetryMultiSeriesQueryDto): Promise<PaginatedResponseDto<TelemetryMultiSeriesPointDto>>;
    delete(id: string): Promise<void>;
}
