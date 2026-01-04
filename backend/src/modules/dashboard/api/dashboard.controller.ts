import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/domain/guards/jwt-auth.guard';
import { DashboardService } from '../domain/dashboard.service';
import { DashboardMetricsQueryDto, DashboardMetricsResponseDto } from '../domain/dto/dashboard-metrics.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get global dashboard metrics' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start timestamp (ISO8601). Default: 30 days ago',
    type: String,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End timestamp (ISO8601). Default: now',
    type: String,
    example: '2023-01-31T23:59:59.999Z',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Global dashboard metrics retrieved successfully', 
    type: DashboardMetricsResponseDto 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMetrics(
    @Query() query: DashboardMetricsQueryDto,
  ): Promise<DashboardMetricsResponseDto> {
    return this.dashboardService.getDashboardMetrics(query.from, query.to);
  }
}
