import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { TelemetryMultiSeriesQueryDto, TelemetryQueryDto, TelemetrySeriesQueryDto } from './dto/telemetry-query.dto';
import { 
  PaginatedResponseDto, 
  TelemetryMultiSeriesPointDto, 
  TelemetryReadingDto, 
  TelemetrySeriesPointDto 
} from './dto/telemetry-response.dto';
import { MachinesService } from '../../machines/domain/machines.service';
import { AlarmsEvaluatorService } from '../../alarms/domain/alarms-evaluator.service';
import { EmissionsService } from '../../emissions/domain/emissions.service';


@Injectable()
export class TelemetryService {
  constructor(
    private readonly telemetryRepository: TelemetryRepository,
    private readonly machinesService: MachinesService,
    private readonly alarmsEvaluatorService: AlarmsEvaluatorService,
    @Inject(forwardRef(() => EmissionsService))
    private readonly emissionsService: EmissionsService,
  ) {}

  async create(createTelemetryDto: CreateTelemetryDto): Promise<TelemetryReadingDto> {
    const serverTs = new Date().toISOString();

    const telemetryWithServerTs: CreateTelemetryDto & { ts: string } = {
      ...createTelemetryDto,
      ts: serverTs,
    };

    const reading = await this.telemetryRepository.create(telemetryWithServerTs);

    this.machinesService.updateDeviceLastSeen(reading.machineId).catch((error) => {
      console.error('Failed to update device last seen timestamp:', error);
    });

    await this.alarmsEvaluatorService.evaluateAndUpsert(reading.machineId, {
      machineId: reading.machineId,
      ts: reading.ts,
      voltageV: reading.voltageV,
      currentA: reading.currentA,
      temperatureC: reading.temperatureC,
      seq: reading.seq,
    });

    // ✅ agora reading.id existe no DTO
    this.emissionsService
      .computeAndPersist(reading.machineId, reading.id)
      .catch((error) => {
        console.error('Failed to compute emissions:', error);
      });

    // ✅ devolve com id (pode devolver reading direto)
    return reading;
  }


  async findAll(
    query: TelemetryQueryDto,
  ): Promise<PaginatedResponseDto<TelemetryReadingDto>> {
    const result = await this.telemetryRepository.findAll(query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    };
  }

  async findLatest(machineId: string): Promise<TelemetryReadingDto> {
    const reading = await this.telemetryRepository.findLatest(machineId);

    if (!reading) {
      throw new NotFoundException(`No telemetry readings found for machine ${machineId}`);
    }

    return reading;
  }

  async findSeries(
    metric: 'voltage' | 'current' | 'temperature',
    query: TelemetrySeriesQueryDto,
  ): Promise<PaginatedResponseDto<TelemetrySeriesPointDto>> {
    const result = await this.telemetryRepository.findSeries(metric, query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        bucket: result.bucket,
        fill: result.fill,
        from: result.from,
        to: result.to,
      },
    };
  }

  async findMultiSeries(
    query: TelemetryMultiSeriesQueryDto,
  ): Promise<PaginatedResponseDto<TelemetryMultiSeriesPointDto>> {
    const result = await this.telemetryRepository.findMultiSeries(query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        bucket: result.bucket,
        fill: result.fill,
        from: result.from,
        to: result.to,
      },
    };
  }

  async delete(id: string): Promise<void> {
    try {
      await this.telemetryRepository.delete(id);
    } catch (error) {
      throw new NotFoundException(`Telemetry reading with ID ${id} not found`);
    }
  }
}
