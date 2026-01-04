export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare enum BucketSize {
    ONE_MINUTE = "1m",
    FIVE_MINUTES = "5m",
    FIFTEEN_MINUTES = "15m",
    THIRTY_MINUTES = "30m",
    ONE_HOUR = "1h",
    SIX_HOURS = "6h",
    ONE_DAY = "1d"
}
export declare enum FillType {
    NONE = "none",
    NULL = "null",
    ZERO = "zero"
}
export declare class TelemetryQueryDto {
    machineId?: string;
    from?: string;
    to?: string;
    limit?: number;
    order?: SortOrder;
}
export declare class TelemetrySeriesQueryDto extends TelemetryQueryDto {
    bucket?: BucketSize;
    fill?: FillType;
}
export declare class TelemetryMultiSeriesQueryDto extends TelemetrySeriesQueryDto {
    metrics?: string;
}
