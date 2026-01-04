import { EmissionMetric, BucketInterval } from './emissions-query.dto';
export declare class EmissionsSeriesPointDto {
    ts: string;
    value: number;
}
export declare class EmissionsSeriesResponseDto {
    machineId: string;
    metric: EmissionMetric;
    bucket: BucketInterval;
    from: string;
    to: string;
    points: EmissionsSeriesPointDto[];
}
export declare class EmissionsSummaryResponseDto {
    machineId: string;
    from: string;
    to: string;
    energyKwhTotal: number;
    kgco2eTotal: number;
    factorUsed: number | null;
    pointsCount: number;
}
