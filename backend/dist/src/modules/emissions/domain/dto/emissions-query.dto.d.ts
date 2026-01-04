export declare enum EmissionMetric {
    POWER_KW = "power_kw",
    ENERGY_KWH = "energy_kwh",
    KGCO2E = "kgco2e"
}
export declare enum BucketInterval {
    FIVE_MINUTES = "5m",
    FIFTEEN_MINUTES = "15m",
    ONE_HOUR = "1h",
    ONE_DAY = "1d"
}
export declare class EmissionsQueryDto {
    from?: string;
    to?: string;
}
export declare class EmissionsSeriesQueryDto extends EmissionsQueryDto {
    bucket?: BucketInterval;
    metric?: EmissionMetric;
}
