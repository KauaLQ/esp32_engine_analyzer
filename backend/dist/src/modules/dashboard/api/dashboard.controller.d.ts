import { DashboardService } from '../domain/dashboard.service';
import { DashboardMetricsQueryDto, DashboardMetricsResponseDto } from '../domain/dto/dashboard-metrics.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMetrics(query: DashboardMetricsQueryDto): Promise<DashboardMetricsResponseDto>;
}
