export declare class TelemetryReadingDto {
    id: string;
    machineId: string;
    ts: string;
    voltageV: number;
    currentA: number;
    temperatureC: number;
    seq: number;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    meta: {
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
        bucket?: string;
        fill?: string;
        from?: string;
        to?: string;
        [key: string]: any;
    };
}
export declare class TelemetryReadingsResponseDto extends PaginatedResponseDto<TelemetryReadingDto> {
    data: TelemetryReadingDto[];
}
export declare class TelemetrySeriesPointDto {
    ts: string;
    value: number | null;
}
export declare class TelemetrySeriesResponseDto extends PaginatedResponseDto<TelemetrySeriesPointDto> {
    data: TelemetrySeriesPointDto[];
}
export declare class TelemetryMultiSeriesValuesDto {
    voltageV?: number | null;
    currentA?: number | null;
    temperatureC?: number | null;
}
export declare class TelemetryMultiSeriesPointDto {
    ts: string;
    values: TelemetryMultiSeriesValuesDto;
}
export declare class TelemetryMultiSeriesResponseDto extends PaginatedResponseDto<TelemetryMultiSeriesPointDto> {
    data: TelemetryMultiSeriesPointDto[];
}
