import type { DashboardMetricsParams, DashboardMetricsResponse } from '../../types/dashboard';
import http from './http';

// Dashboard API service
const dashboardApi = {
  getDashboardMetrics: async (
      params: DashboardMetricsParams,
  ): Promise<DashboardMetricsResponse> => {
    // ✅ remove undefined/null pra não poluir querystring
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ) as DashboardMetricsParams;

    const { data } = await http.get<DashboardMetricsResponse>('/dashboard/metrics', {
      params: cleanParams,
    });

    return data;
  },
};

export default dashboardApi;
