import { useQuery } from '@tanstack/react-query';
import type { DashboardMetricsParams, DashboardMetricsResponse } from '../../types/dashboard';
import dashboardApi from "../api/dashboard.ts";

export const useDashboardMetrics = (params: DashboardMetricsParams) => {
  // Tipagem explícita do retorno da query para expor corretamente os campos do dashboard
  return useQuery<DashboardMetricsResponse>({
    queryKey: ['dashboardMetrics', params],
    queryFn: () => dashboardApi.getDashboardMetrics(params),
  });
};
