import http from '../../lib/api/http';
import type { 
  TelemetrySeriesResponse, 
  TelemetryLatestReading,
  TelemetrySeriesQueryParams
} from '../../types/telemetry';

// Telemetry API service
const telemetryApi = {
  // Get telemetry series
  getTelemetrySeries: async (params: TelemetrySeriesQueryParams): Promise<TelemetrySeriesResponse> => {
    const response = await http.get<TelemetrySeriesResponse>('/telemetry/series/multi', { params });
    return response.data;
  },

  // Get latest telemetry reading
  getLatestTelemetry: async (machineId: string): Promise<TelemetryLatestReading> => {
    const response = await http.get<TelemetryLatestReading>(`/telemetry/machine/${machineId}/latest`);
    return response.data;
  }
};

export default telemetryApi;
