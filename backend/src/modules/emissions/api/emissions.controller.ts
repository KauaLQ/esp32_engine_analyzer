import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmissionsService } from '../domain/emissions.service';
import { EmissionsQueryDto, EmissionsSeriesQueryDto } from '../domain/dto/emissions-query.dto';
import { EmissionsSeriesResponseDto, EmissionsSummaryResponseDto } from '../domain/dto/emissions-response.dto';

@ApiTags('emissions')
@Controller('machines/:machineId/emissions')
export class EmissionsController {
  constructor(private readonly emissionsService: EmissionsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get emissions summary for a machine' })
  @ApiParam({ name: 'machineId', description: 'Machine ID' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO format)' })
  @ApiResponse({
    status: 200,
    description: 'Emissions summary',
    type: EmissionsSummaryResponseDto,
  })
  async getSummary(
    @Param('machineId') machineId: string,
    @Query() query: EmissionsQueryDto,
  ): Promise<EmissionsSummaryResponseDto> {
    return this.emissionsService.getSummary(machineId, query);
  }

  @Get('series')
  @ApiOperation({ summary: 'Get emissions time series for a machine' })
  @ApiParam({ name: 'machineId', description: 'Machine ID' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'bucket', required: false, description: 'Time bucket interval (5m, 15m, 1h, 1d)' })
  @ApiQuery({ name: 'metric', required: false, description: 'Metric to query (power_kw, energy_kwh, kgco2e)' })
  @ApiResponse({
    status: 200,
    description: 'Emissions time series',
    type: EmissionsSeriesResponseDto,
  })
  async getSeries(
    @Param('machineId') machineId: string,
    @Query() query: EmissionsSeriesQueryDto,
  ): Promise<EmissionsSeriesResponseDto> {
    return this.emissionsService.getSeries(machineId, query);
  }
}
