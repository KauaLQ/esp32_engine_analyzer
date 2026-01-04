import { PrismaService } from '../../../prisma/prisma.service';
import { EmissionMetric, BucketInterval } from '../domain/dto/emissions-query.dto';
import { EmissionsSeriesPointDto } from '../domain/dto/emissions-response.dto';
export declare class EmissionsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findTelemetryReadingById(id: string | number): Promise<any>;
    findPreviousTelemetryReading(machineId: string, currentTs: string): Promise<any>;
    findEmissionFactor(machineId: string): Promise<any>;
    updateTelemetryReadingPayload(id: string | number, computed: any): Promise<void>;
    getSummary(machineId: string, from: string, to: string): Promise<any>;
    getSeries(machineId: string, from: string, to: string, bucket: BucketInterval, metric: EmissionMetric): Promise<{
        points: EmissionsSeriesPointDto[];
    }>;
    private getMetricValue;
    private getBucketMilliseconds;
}
