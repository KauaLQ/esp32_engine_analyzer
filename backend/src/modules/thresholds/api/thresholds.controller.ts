import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThresholdsService } from '../domain/thresholds.service';
import {
  CreateAiThresholdProfileDto,
  CreateManualThresholdProfileDto,
  ThresholdProfileDto,
} from '../domain/dto';
import { JwtAuthGuard } from '../../auth/domain/guards/jwt-auth.guard';

@ApiTags('Thresholds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ThresholdsController {
  constructor(private readonly thresholdsService: ThresholdsService) {}

  @Post('machines/:machineId/thresholds/manual')
  @ApiOperation({ summary: 'Create a manual threshold profile' })
  @ApiResponse({
    status: 201,
    description: 'The threshold profile has been successfully created',
    type: ThresholdProfileDto,
  })
  async createManualProfile(
    @Param('machineId') machineId: string,
    @Body() createDto: CreateManualThresholdProfileDto,
    @Request() req,
  ): Promise<ThresholdProfileDto> {
    const userId = req.user?.id;
    return this.thresholdsService.createManualProfile(machineId, createDto, userId);
  }

  @Post('machines/:machineId/thresholds/ai')
  @ApiOperation({ summary: 'Create an AI-based threshold profile' })
  @ApiResponse({
    status: 201,
    description: 'The threshold profile has been successfully created',
    type: ThresholdProfileDto,
  })
  @ApiResponse({
    status: 502,
    description: 'Failed to create AI threshold profile',
  })
  async createAiProfile(
    @Param('machineId') machineId: string,
    @Body() createDto: CreateAiThresholdProfileDto,
    @Request() req,
  ): Promise<ThresholdProfileDto> {
    const userId = req.user?.id;
    return this.thresholdsService.createAiProfile(machineId, createDto, userId);
  }

  @Get('machines/:machineId/thresholds')
  @ApiOperation({ summary: 'Get the active threshold profile for a machine' })
  @ApiResponse({
    status: 200,
    description: 'The active threshold profile',
    type: ThresholdProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No active threshold profile found',
  })
  async getActiveProfile(
    @Param('machineId') machineId: string,
  ): Promise<ThresholdProfileDto> {
    return this.thresholdsService.getActiveProfile(machineId);
  }

  @Get('machines/:machineId/thresholds/history')
  @ApiOperation({ summary: 'Get the threshold profile history for a machine' })
  @ApiResponse({
    status: 200,
    description: 'The threshold profile history',
    type: [ThresholdProfileDto],
  })
  async getProfileHistory(
    @Param('machineId') machineId: string,
  ): Promise<ThresholdProfileDto[]> {
    return this.thresholdsService.getProfileHistory(machineId);
  }
}
