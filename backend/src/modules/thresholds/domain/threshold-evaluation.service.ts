import { Injectable, Logger } from '@nestjs/common';
import { ThresholdsRepository } from '../repositories/thresholds.repository';
import { AlarmsService } from '../../alarms/domain/alarms.service';
import { AlarmSeverity } from '../../alarms/domain/dto';

interface TelemetryReading {
  machineId: string;
  ts: string;
  voltageV?: number;
  currentA?: number;
  temperatureC?: number;
  seq?: number;
}

@Injectable()
export class ThresholdEvaluationService {
  private readonly logger = new Logger(ThresholdEvaluationService.name);

  constructor(
    private readonly thresholdsRepository: ThresholdsRepository,
    private readonly alarmsService: AlarmsService,
  ) {}

  async evaluateAndEmitAlarms(machineId: string, reading: TelemetryReading): Promise<void> {
    try {
      // Get active threshold profile for the machine
      const profile = await this.thresholdsRepository.findActiveProfile(machineId);
      
      // If no active profile, skip evaluation
      if (!profile || !profile.payload.thresholds) {
        return;
      }

      const { thresholds } = profile.payload;
      const { voltageV, currentA, temperatureC, ts } = reading;

      // Evaluate voltage thresholds
      if (voltageV !== undefined && thresholds.voltage) {
        await this.evaluateVoltage(machineId, voltageV, thresholds.voltage, ts, profile.id);
      }

      // Evaluate current thresholds
      if (currentA !== undefined && thresholds.current) {
        await this.evaluateCurrent(machineId, currentA, thresholds.current, ts, profile.id);
      }

      // Evaluate temperature thresholds
      if (temperatureC !== undefined && thresholds.temperature_tcase) {
        await this.evaluateTemperature(machineId, temperatureC, thresholds.temperature_tcase, ts, profile.id);
      }
    } catch (error) {
      this.logger.error(`Error evaluating thresholds for machine ${machineId}: ${error.message}`);
    }
  }

  private async evaluateVoltage(
    machineId: string,
    voltageV: number,
    thresholds: any,
    ts: string,
    profileId: string,
  ): Promise<void> {
    // Check high voltage
    if (thresholds.crit_high_v && voltageV > thresholds.crit_high_v) {
      const delta = voltageV - thresholds.crit_high_v;
      await this.createVoltageAlarm(
        machineId,
        'high',
        voltageV,
        thresholds.crit_high_v,
        delta,
        ts,
        profileId,
        AlarmSeverity.CRIT,
      );
    } else if (thresholds.warn_high_v && voltageV > thresholds.warn_high_v) {
      const delta = voltageV - thresholds.warn_high_v;
      await this.createVoltageAlarm(
        machineId,
        'high',
        voltageV,
        thresholds.warn_high_v,
        delta,
        ts,
        profileId,
        AlarmSeverity.WARN,
      );
    } else {
      // Close high voltage alarm if it exists
      await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:voltage:high');
    }

    // Check low voltage
    if (thresholds.crit_low_v && voltageV < thresholds.crit_low_v) {
      const delta = thresholds.crit_low_v - voltageV;
      await this.createVoltageAlarm(
        machineId,
        'low',
        voltageV,
        thresholds.crit_low_v,
        delta,
        ts,
        profileId,
        AlarmSeverity.CRIT,
      );
    } else if (thresholds.warn_low_v && voltageV < thresholds.warn_low_v) {
      const delta = thresholds.warn_low_v - voltageV;
      await this.createVoltageAlarm(
        machineId,
        'low',
        voltageV,
        thresholds.warn_low_v,
        delta,
        ts,
        profileId,
        AlarmSeverity.WARN,
      );
    } else {
      // Close low voltage alarm if it exists
      await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:voltage:low');
    }
  }

  private async evaluateCurrent(
    machineId: string,
    currentA: number,
    thresholds: any,
    ts: string,
    profileId: string,
  ): Promise<void> {
    // Check high current
    if (thresholds.crit_high_a && currentA > thresholds.crit_high_a) {
      const delta = currentA - thresholds.crit_high_a;
      await this.createCurrentAlarm(
        machineId,
        'high',
        currentA,
        thresholds.crit_high_a,
        delta,
        ts,
        profileId,
        AlarmSeverity.CRIT,
      );
    } else if (thresholds.warn_high_a && currentA > thresholds.warn_high_a) {
      const delta = currentA - thresholds.warn_high_a;
      await this.createCurrentAlarm(
        machineId,
        'high',
        currentA,
        thresholds.warn_high_a,
        delta,
        ts,
        profileId,
        AlarmSeverity.WARN,
      );
    } else {
      // Close high current alarm if it exists
      await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:current:high');
    }
  }

  private async evaluateTemperature(
    machineId: string,
    temperatureC: number,
    thresholds: any,
    ts: string,
    profileId: string,
  ): Promise<void> {
    // Check high temperature
    if (thresholds.crit_high_c && temperatureC > thresholds.crit_high_c) {
      const delta = temperatureC - thresholds.crit_high_c;
      await this.createTemperatureAlarm(
        machineId,
        'high',
        temperatureC,
        thresholds.crit_high_c,
        delta,
        ts,
        profileId,
        AlarmSeverity.CRIT,
      );
    } else if (thresholds.warn_high_c && temperatureC > thresholds.warn_high_c) {
      const delta = temperatureC - thresholds.warn_high_c;
      await this.createTemperatureAlarm(
        machineId,
        'high',
        temperatureC,
        thresholds.warn_high_c,
        delta,
        ts,
        profileId,
        AlarmSeverity.WARN,
      );
    } else {
      // Close high temperature alarm if it exists
      await this.alarmsService.closeThresholdAlarm(machineId, 'threshold:temperature:high');
    }
  }

  private async createVoltageAlarm(
    machineId: string,
    direction: 'high' | 'low',
    value: number,
    limit: number,
    delta: number,
    readingTs: string,
    thresholdProfileId: string,
    severityRule: AlarmSeverity,
  ): Promise<void> {
    const dedupeKey = `threshold:voltage:${direction}`;
    const readingDate = new Date(readingTs);
    const formattedDate = `${readingDate.getDate()}/${readingDate.getMonth() + 1}/${readingDate.getFullYear()}`;
    
    const title = `Em ${formattedDate} a máquina ${machineId} ficou ${delta.toFixed(1)}V ${direction === 'high' ? 'acima' : 'abaixo'} do limite (${limit}V)`;
    
    const details = {
      metric: 'voltage',
      direction,
      value,
      limit,
      delta,
      unit: 'V',
      readingTs,
      thresholdProfileId,
      severityRule,
    };

    await this.alarmsService.createOrUpdateThresholdAlarm(
      machineId,
      dedupeKey,
      severityRule,
      title,
      details,
    );
  }

  private async createCurrentAlarm(
    machineId: string,
    direction: 'high',
    value: number,
    limit: number,
    delta: number,
    readingTs: string,
    thresholdProfileId: string,
    severityRule: AlarmSeverity,
  ): Promise<void> {
    const dedupeKey = `threshold:current:${direction}`;
    const readingDate = new Date(readingTs);
    const formattedDate = `${readingDate.getDate()}/${readingDate.getMonth() + 1}/${readingDate.getFullYear()}`;
    
    const title = `Em ${formattedDate} a máquina ${machineId} ficou ${delta.toFixed(1)}A acima do limite (${limit}A)`;
    
    const details = {
      metric: 'current',
      direction,
      value,
      limit,
      delta,
      unit: 'A',
      readingTs,
      thresholdProfileId,
      severityRule,
    };

    await this.alarmsService.createOrUpdateThresholdAlarm(
      machineId,
      dedupeKey,
      severityRule,
      title,
      details,
    );
  }

  private async createTemperatureAlarm(
    machineId: string,
    direction: 'high',
    value: number,
    limit: number,
    delta: number,
    readingTs: string,
    thresholdProfileId: string,
    severityRule: AlarmSeverity,
  ): Promise<void> {
    const dedupeKey = `threshold:temperature:${direction}`;
    const readingDate = new Date(readingTs);
    const formattedDate = `${readingDate.getDate()}/${readingDate.getMonth() + 1}/${readingDate.getFullYear()}`;
    
    const title = `Em ${formattedDate} a máquina ${machineId} ficou ${delta.toFixed(1)}°C acima do limite (${limit}°C)`;
    
    const details = {
      metric: 'temperature',
      direction,
      value,
      limit,
      delta,
      unit: 'C',
      readingTs,
      thresholdProfileId,
      severityRule,
    };

    await this.alarmsService.createOrUpdateThresholdAlarm(
      machineId,
      dedupeKey,
      severityRule,
      title,
      details,
    );
  }
}
