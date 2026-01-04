import { Injectable, NotFoundException } from '@nestjs/common';
import { AlarmsRepository } from '../repositories/alarms.repository';
import {
  AlarmDto,
  AlarmQueryDto,
  AlarmSeverity,
  AlarmStatus,
  CreateAlarmDto,
  PaginatedResponseDto,
} from './dto';

@Injectable()
export class AlarmsService {
  constructor(private readonly alarmsRepository: AlarmsRepository) {}

  async create(createDto: CreateAlarmDto, userId?: string): Promise<AlarmDto> {
    return this.alarmsRepository.create(createDto, userId);
  }

  async findAll(query: AlarmQueryDto): Promise<PaginatedResponseDto<AlarmDto>> {
    const result = await this.alarmsRepository.findAll(query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    };
  }

  async findById(id: string): Promise<AlarmDto> {
    const alarm = await this.alarmsRepository.findById(id);
    if (!alarm) {
      throw new NotFoundException(`Alarm with ID ${id} not found`);
    }
    return alarm;
  }

  async acknowledge(id: string, userId: string): Promise<AlarmDto> {
    const alarm = await this.findById(id);
    if (alarm.status !== AlarmStatus.OPEN) {
      throw new Error(`Cannot acknowledge alarm with status ${alarm.status}`);
    }
    return this.alarmsRepository.acknowledge(id, userId);
  }

  async close(id: string, userId: string): Promise<AlarmDto> {
    const alarm = await this.findById(id);
    if (alarm.status === AlarmStatus.CLOSED) {
      throw new Error('Alarm is already closed');
    }
    return this.alarmsRepository.close(id, userId);
  }

  async delete(id: string): Promise<void> {
    const alarm = await this.findById(id);
    return this.alarmsRepository.delete(id);
  }

  // Methods for threshold evaluation integration
  async createOrUpdateThresholdAlarm(
    machineId: string,
    dedupeKey: string,
    severity: AlarmSeverity,
    title: string,
    details: Record<string, any>,
  ): Promise<AlarmDto> {
    // Check if an open alarm with the same dedupe key exists
    const existingAlarm = await this.alarmsRepository.findByDedupeKey(
      machineId,
      dedupeKey,
      AlarmStatus.OPEN,
    );

    if (existingAlarm) {
      // Update existing alarm
      await this.alarmsRepository.updateLastSeen(existingAlarm.id);

      // Update severity if it's higher than current
      if (this.isSeverityHigher(severity, existingAlarm.severity)) {
        await this.alarmsRepository.updateSeverity(existingAlarm.id, severity);
      }

      // Update title and details
      return this.alarmsRepository.updateDetails(existingAlarm.id, title, details);
    } else {
      // Create new alarm
      return this.create({
        machineId,
        type: 'threshold_breach',
        severity,
        title,
        details,
        dedupeKey,
      });
    }
  }

  async closeThresholdAlarm(machineId: string, dedupeKey: string): Promise<void> {
    const existingAlarm = await this.alarmsRepository.findByDedupeKey(
      machineId,
      dedupeKey,
      AlarmStatus.OPEN,
    );

    if (existingAlarm) {
      await this.alarmsRepository.close(existingAlarm.id, "");
    }
  }

  private isSeverityHigher(newSeverity: AlarmSeverity, currentSeverity: AlarmSeverity): boolean {
    const severityOrder = {
      [AlarmSeverity.INFO]: 1,
      [AlarmSeverity.WARN]: 2,
      [AlarmSeverity.CRIT]: 3,
    };

    return severityOrder[newSeverity] > severityOrder[currentSeverity];
  }
}
