import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AlarmsService } from '../domain/alarms.service';
import {
  AlarmDto,
  AlarmQueryDto,
  CreateAlarmDto,
  PaginatedResponseDto,
} from '../domain/dto';
import { JwtAuthGuard } from '../../auth/domain/guards/jwt-auth.guard';

@ApiTags('Alarms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alarms')
export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alarms with filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of alarms',
    type: () => PaginatedResponseDto,
  })
  async findAll(@Query() query: AlarmQueryDto): Promise<PaginatedResponseDto<AlarmDto>> {
    return this.alarmsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific alarm by ID' })
  @ApiResponse({
    status: 200,
    description: 'The alarm',
    type: AlarmDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alarm not found',
  })
  async findOne(@Param('id') id: string): Promise<AlarmDto> {
    return this.alarmsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new alarm manually' })
  @ApiResponse({
    status: 201,
    description: 'The alarm has been successfully created',
    type: AlarmDto,
  })
  async create(
    @Body() createDto: CreateAlarmDto,
    @Request() req,
  ): Promise<AlarmDto> {
    const userId = req.user?.id;
    return this.alarmsService.create(createDto, userId);
  }

  @Post(':id/ack')
  @ApiOperation({ summary: 'Acknowledge an alarm' })
  @ApiResponse({
    status: 200,
    description: 'The alarm has been acknowledged',
    type: AlarmDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alarm not found',
  })
  async acknowledge(
    @Param('id') id: string,
    @Request() req,
  ): Promise<AlarmDto> {
    const userId = req.user?.id;
    return this.alarmsService.acknowledge(id, userId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close an alarm' })
  @ApiResponse({
    status: 200,
    description: 'The alarm has been closed',
    type: AlarmDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alarm not found',
  })
  async close(
    @Param('id') id: string,
    @Request() req,
  ): Promise<AlarmDto> {
    const userId = req.user?.id;
    return this.alarmsService.close(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alarm' })
  @ApiResponse({
    status: 200,
    description: 'The alarm has been deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Alarm not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.alarmsService.delete(id);
  }
}
