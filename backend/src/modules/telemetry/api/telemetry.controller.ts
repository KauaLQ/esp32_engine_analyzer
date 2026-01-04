import { Controller, Get, Post, Body, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TelemetryService } from '../domain/telemetry.service';
import { CreateTelemetryDto } from '../domain/dto/create-telemetry.dto';
import { BucketSize, FillType, TelemetryMultiSeriesQueryDto, TelemetryQueryDto, TelemetrySeriesQueryDto } from '../domain/dto/telemetry-query.dto';
import { 
  PaginatedResponseDto, 
  TelemetryMultiSeriesPointDto,
  TelemetryMultiSeriesResponseDto,
  TelemetryReadingDto, 
  TelemetryReadingsResponseDto,
  TelemetrySeriesPointDto,
  TelemetrySeriesResponseDto
} from '../domain/dto/telemetry-response.dto';

@ApiTags('Telemetry')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new telemetry reading' })
  @ApiResponse({ 
    status: 201, 
    description: 'Telemetry reading created successfully',
    type: TelemetryReadingDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTelemetryDto: CreateTelemetryDto): Promise<TelemetryReadingDto> {
    return this.telemetryService.create(createTelemetryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all telemetry readings with pagination and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Telemetry readings retrieved successfully',
    type: TelemetryReadingsResponseDto
  })
  async findAll(@Query() query: TelemetryQueryDto): Promise<PaginatedResponseDto<TelemetryReadingDto>> {
    return this.telemetryService.findAll(query);
  }

  @Get('machine/:machineId/latest')
  @ApiOperation({ summary: 'Get the latest telemetry reading for a specific machine' })
  @ApiParam({ name: 'machineId', description: 'The ID of the machine' })
  @ApiResponse({ 
    status: 200, 
    description: 'Latest telemetry reading retrieved successfully',
    type: TelemetryReadingDto
  })
  @ApiResponse({ status: 404, description: 'No telemetry readings found for the machine' })
  async findLatest(@Param('machineId') machineId: string): Promise<TelemetryReadingDto> {
    return this.telemetryService.findLatest(machineId);
  }

  @Get('series')
  @ApiOperation({ summary: 'Get time series data for a specific metric' })
  @ApiQuery({ 
    name: 'metric', 
    description: 'The metric to get time series data for',
    enum: ['voltage', 'current', 'temperature'],
    required: true
  })
  @ApiQuery({ 
    name: 'machineId', 
    description: 'The ID of the machine',
    type: String,
    required: true
  })
  @ApiQuery({ 
    name: 'from', 
    description: 'Start timestamp (ISO8601)',
    type: String,
    required: false
  })
  @ApiQuery({ 
    name: 'to', 
    description: 'End timestamp (ISO8601)',
    type: String,
    required: false
  })
  @ApiQuery({ 
    name: 'bucket', 
    description: 'Aggregation bucket size',
    enum: BucketSize,
    required: false
  })
  @ApiQuery({ 
    name: 'fill', 
    description: 'Gap filling strategy',
    enum: FillType,
    required: false,
    default: FillType.NONE
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Maximum number of points to return (only when bucket is not specified)',
    type: Number,
    required: false
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Time series data retrieved successfully',
    type: TelemetrySeriesResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findSeries(
    @Query('metric') metric: 'voltage' | 'current' | 'temperature',
    @Query() query: TelemetrySeriesQueryDto
  ): Promise<PaginatedResponseDto<TelemetrySeriesPointDto>> {
    return this.telemetryService.findSeries(metric, query);
  }

  @Get('series/multi')
  @ApiOperation({ summary: 'Get time series data for multiple metrics' })
  @ApiQuery({ 
    name: 'machineId', 
    description: 'The ID of the machine',
    type: String,
    required: true
  })
  @ApiQuery({ 
    name: 'metrics', 
    description: 'Comma-separated list of metrics to include (voltage, current, temperature)',
    type: String,
    required: false,
    default: 'voltage,current,temperature'
  })
  @ApiQuery({ 
    name: 'from', 
    description: 'Start timestamp (ISO8601)',
    type: String,
    required: false
  })
  @ApiQuery({ 
    name: 'to', 
    description: 'End timestamp (ISO8601)',
    type: String,
    required: false
  })
  @ApiQuery({ 
    name: 'bucket', 
    description: 'Aggregation bucket size',
    enum: BucketSize,
    required: false
  })
  @ApiQuery({ 
    name: 'fill', 
    description: 'Gap filling strategy',
    enum: FillType,
    required: false,
    default: FillType.NONE
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Multi-metric time series data retrieved successfully',
    type: TelemetryMultiSeriesResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findMultiSeries(
    @Query() query: TelemetryMultiSeriesQueryDto
  ): Promise<PaginatedResponseDto<TelemetryMultiSeriesPointDto>> {
    return this.telemetryService.findMultiSeries(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a telemetry reading' })
  @ApiParam({ name: 'id', description: 'The ID of the telemetry reading to delete' })
  @ApiResponse({ status: 204, description: 'Telemetry reading deleted successfully' })
  @ApiResponse({ status: 404, description: 'Telemetry reading not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.telemetryService.delete(id);
  }
}
