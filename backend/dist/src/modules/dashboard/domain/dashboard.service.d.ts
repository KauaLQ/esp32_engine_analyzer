import { DashboardRepository } from '../repositories/dashboard.repository';
import { DashboardMetricsResponseDto } from './dto/dashboard-metrics.dto';
export declare class DashboardService {
    private readonly dashboardRepository;
    constructor(dashboardRepository: DashboardRepository);
    getDashboardMetrics(from?: string, to?: string): Promise<DashboardMetricsResponseDto>;
}
