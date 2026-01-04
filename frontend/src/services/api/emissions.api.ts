import http from '../../lib/api/http';
import type { 
  EmissionsSummary, 
  EmissionsSeries,
  EmissionsSummaryQueryParams,
  EmissionsSeriesQueryParams
} from '../../types/emissions';

// Emissions API service
const emissionsApi = {
  // Get emissions summary
  getEmissionsSummary: async (machineId: string, params: EmissionsSummaryQueryParams): Promise<EmissionsSummary> => {
    const response = await http.get<EmissionsSummary>(`/machines/${machineId}/emissions/summary`, { params });
    return response.data;
  },

  // Get emissions series
  getEmissionsSeries: async (machineId: string, params: EmissionsSeriesQueryParams): Promise<EmissionsSeries> => {
    const response = await http.get<EmissionsSeries>(`/machines/${machineId}/emissions/series`, { params });
    return response.data;
  }
};

export default emissionsApi;
