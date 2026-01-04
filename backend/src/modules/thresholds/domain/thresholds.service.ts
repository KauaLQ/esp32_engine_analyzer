import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ThresholdsRepository } from '../repositories/thresholds.repository';
import { N8nClient } from '../infra/n8n.client';
import {
  CreateAiThresholdProfileDto,
  CreateManualThresholdProfileDto,
  ThresholdProfileDto,
} from './dto';

@Injectable()
export class ThresholdsService {
  constructor(
    private readonly thresholdsRepository: ThresholdsRepository,
    private readonly n8nClient: N8nClient,
  ) {}

  async createManualProfile(
    machineId: string,
    createDto: CreateManualThresholdProfileDto,
    userId?: string,
  ): Promise<ThresholdProfileDto> {
    // If notes are provided, add them to the payload
    const payload = { ...createDto.payload };
    if (createDto.notes) {
      payload.notes = createDto.notes;
    }

    return this.thresholdsRepository.createManualProfile(machineId, payload, userId);
  }

  async createAiProfile(
    machineId: string,
    createDto: CreateAiThresholdProfileDto,
    userId?: string,
  ): Promise<ThresholdProfileDto> {
    const { manufacturer, model } = createDto;

    try {
      // Build the model label and query
      const modelLabel = `${manufacturer} ${model}`;
      const query = `${manufacturer} ${model} datasheet filetype:pdf`;

      // Call the N8N webhook
      const aiResponse = await this.n8nClient.validateDevice(manufacturer, model);

      // Validate the response
      this.validateAiResponse(aiResponse);

      // Create the AI request object
      const aiRequest = { model: modelLabel, query };

      // Create the threshold profile
      return this.thresholdsRepository.createAiProfile(
        machineId,
        aiRequest,
        aiResponse,
        userId,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadGatewayException(`Failed to create AI threshold profile: ${error.message}`);
      }
      throw new BadGatewayException('Failed to create AI threshold profile');
    }
  }

  async getActiveProfile(machineId: string): Promise<ThresholdProfileDto> {
    const profile = await this.thresholdsRepository.findActiveProfile(machineId);
    if (!profile) {
      throw new NotFoundException(`No active threshold profile found for machine ${machineId}`);
    }
    return profile;
  }

  async getProfileHistory(machineId: string): Promise<ThresholdProfileDto[]> {
    return this.thresholdsRepository.findProfileHistory(machineId);
  }

  private validateAiResponse(response: Record<string, any>): void {
    // Check if the response has the required structure
    if (!response.thresholds) {
      throw new Error('AI response is missing thresholds data');
    }

    const { thresholds } = response;

    // Check for required threshold categories
    if (!thresholds.voltage) {
      throw new Error('AI response is missing voltage thresholds');
    }
    if (!thresholds.current) {
      throw new Error('AI response is missing current thresholds');
    }
    if (!thresholds.temperature_tcase) {
      throw new Error('AI response is missing temperature thresholds');
    }
  }
}
