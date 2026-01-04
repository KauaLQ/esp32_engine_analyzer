// Telemetry types

// Telemetry reading values
export interface TelemetryValues {
  voltageV: number;
  currentA: number;
  temperatureC: number;
  [key: string]: number;
}

// Telemetry series point
export interface TelemetrySeriesPoint {
  ts: string;
  values: TelemetryValues;
}

// Telemetry series response
export interface TelemetrySeriesResponse {
  data: TelemetrySeriesPoint[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Telemetry latest reading
export interface TelemetryLatestReading {
  id: string;
  machineId: string;
  ts: string;
  voltageV: number;
  currentA: number;
  temperatureC: number;
  seq: number;
}

// Telemetry series query params
export interface TelemetrySeriesQueryParams {
  machineId: string;
  from?: string;
  to?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  bucket?: '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '1d' | '--';
  fill?: 'none' | 'null' | 'zero' | '--';
  metrics?: string;
}
