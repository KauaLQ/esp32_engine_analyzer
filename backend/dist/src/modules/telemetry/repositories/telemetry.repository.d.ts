import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTelemetryDto } from '../domain/dto/create-telemetry.dto';
import { TelemetryMultiSeriesQueryDto, TelemetryQueryDto, TelemetrySeriesQueryDto } from '../domain/dto/telemetry-query.dto';
import { TelemetryMultiSeriesPointDto, TelemetryReadingDto } from '../domain/dto/telemetry-response.dto';
type Metric = 'voltage' | 'current' | 'temperature';
export declare class TelemetryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createTelemetryDto: CreateTelemetryDto): Promise<TelemetryReadingDto>;
    findAll(query: TelemetryQueryDto): Promise<{
        data: TelemetryReadingDto[];
        total: number;
        limit: number;
        hasMore: boolean;
    }>;
    findLatest(machineId: string): Promise<TelemetryReadingDto | null>;
    findSeries(metric: Metric, query: TelemetrySeriesQueryDto): Promise<{
        data: {
            ts: string;
            value: number | null;
        }[];
        total: number;
        bucket?: string;
        fill?: string;
        from?: string;
        to?: string;
    }>;
    private fillGaps;
    findMultiSeries(query: TelemetryMultiSeriesQueryDto): Promise<{
        data: TelemetryMultiSeriesPointDto[];
        total: number;
        bucket?: string;
        fill?: string;
        from?: string;
        to?: string;
    }>;
    private fillMultiSeriesGaps;
    delete(id: string): Promise<void>;
    private mapTelemetryReading;
    private buildTsWhere;
    private toBigIntId;
    private getMetricKey;
    private parseBucketMinutes;
}
export {};
