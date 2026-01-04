import { Injectable, Logger } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { ThresholdsRepository } from '../../thresholds/repositories/thresholds.repository';
import { AlarmSeverity } from './dto';

type Metric = 'voltage' | 'current' | 'temperature';
type Kind = 'HIGH' | 'LOW';
type Level = 'WARN' | 'CRIT' | 'HARD';
type Unit = 'V' | 'A' | 'C';

interface TelemetryReading {
  machineId: string;
  ts: string;
  voltageV?: number;
  currentA?: number;
  temperatureC?: number;
  seq?: number;
}

interface VoltageThresholds {
  warn_low_v?: number;
  crit_low_v?: number;
  warn_high_v?: number;
  crit_high_v?: number;
  hard_min_v?: number;
  hard_max_v?: number;
}

interface CurrentThresholds {
  warn_high_a?: number;
  crit_high_a?: number;
  hard_max_a?: number;
}

interface TemperatureThresholds {
  warn_high_c?: number;
  crit_high_c?: number;
  hard_max_c?: number;
}

interface ThresholdViolation {
  metric: Metric;
  kind: Kind;
  value: number;
  limit: number;
  level: Level;
  unit: Unit;
}

interface AlarmDetails {
  metric: Metric;
  kind: Kind;
  value: number;
  limit: number;
  level: Level;
  unit: Unit;
  reading: {
    ts: string;
    seq?: number;
  };
}

@Injectable()
export class AlarmsEvaluatorService {
  private readonly logger = new Logger(AlarmsEvaluatorService.name);

  constructor(
    private readonly alarmsService: AlarmsService,
    private readonly thresholdsRepository: ThresholdsRepository,
  ) {}

  async evaluateAndUpsert(machineId: string, reading: TelemetryReading): Promise<void> {
    try {
      const profile = await this.thresholdsRepository.findActiveProfile(machineId);
      console.log("Verificando o threshold atual: " + profile?.payload.thresholds.voltage.hard_max_v);

      // se profile/payload/thresholds não existe, não faz nada
      const thresholds = (profile as any)?.payload?.thresholds as {
        voltage?: VoltageThresholds;
        current?: CurrentThresholds;
        temperature_tcase?: TemperatureThresholds;
      } | undefined;

      console.log(thresholds);

      if (!thresholds) return;

      const { voltageV, currentA, temperatureC, ts, seq } = reading;

      // ✅ TIPADO (não vira never[])
      const violations: ThresholdViolation[] = [];

      if (typeof voltageV === 'number' && thresholds.voltage) {
        violations.push(...this.evaluateVoltage(voltageV, thresholds.voltage));
      }

      if (typeof currentA === 'number' && thresholds.current) {
        violations.push(...this.evaluateCurrent(currentA, thresholds.current));
      }

      if (typeof temperatureC === 'number' && thresholds.temperature_tcase) {
        violations.push(...this.evaluateTemperature(temperatureC, thresholds.temperature_tcase));
      }
      console.log(violations);
      for (const violation of violations) {
        await this.createOrUpdateAlarm(machineId, violation, { ts, seq });
      }
    } catch (error: any) {
      this.logger.error(
        `Error evaluating thresholds for machine ${machineId}: ${error?.message ?? error}`,
      );
    }
  }

  private evaluateVoltage(value: number, t: VoltageThresholds): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];

    // HIGH
    if (typeof t.hard_max_v === 'number' && value > t.hard_max_v) {
      violations.push({ metric: 'voltage', kind: 'HIGH', value, limit: t.hard_max_v, level: 'HARD', unit: 'V' });
    } else if (typeof t.crit_high_v === 'number' && value > t.crit_high_v) {
      violations.push({ metric: 'voltage', kind: 'HIGH', value, limit: t.crit_high_v, level: 'CRIT', unit: 'V' });
    } else if (typeof t.warn_high_v === 'number' && value > t.warn_high_v) {
      violations.push({ metric: 'voltage', kind: 'HIGH', value, limit: t.warn_high_v, level: 'WARN', unit: 'V' });
    }

    // LOW
    if (typeof t.hard_min_v === 'number' && value < t.hard_min_v) {
      violations.push({ metric: 'voltage', kind: 'LOW', value, limit: t.hard_min_v, level: 'HARD', unit: 'V' });
    } else if (typeof t.crit_low_v === 'number' && value < t.crit_low_v) {
      violations.push({ metric: 'voltage', kind: 'LOW', value, limit: t.crit_low_v, level: 'CRIT', unit: 'V' });
    } else if (typeof t.warn_low_v === 'number' && value < t.warn_low_v) {
      violations.push({ metric: 'voltage', kind: 'LOW', value, limit: t.warn_low_v, level: 'WARN', unit: 'V' });
    }

    return violations;
  }

  private evaluateCurrent(value: number, t: CurrentThresholds): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];

    if (typeof t.hard_max_a === 'number' && value > t.hard_max_a) {
      violations.push({ metric: 'current', kind: 'HIGH', value, limit: t.hard_max_a, level: 'HARD', unit: 'A' });
    } else if (typeof t.crit_high_a === 'number' && value > t.crit_high_a) {
      violations.push({ metric: 'current', kind: 'HIGH', value, limit: t.crit_high_a, level: 'CRIT', unit: 'A' });
    } else if (typeof t.warn_high_a === 'number' && value > t.warn_high_a) {
      violations.push({ metric: 'current', kind: 'HIGH', value, limit: t.warn_high_a, level: 'WARN', unit: 'A' });
    }

    return violations;
  }

  private evaluateTemperature(value: number, t: TemperatureThresholds): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];

    if (typeof t.hard_max_c === 'number' && value > t.hard_max_c) {
      violations.push({ metric: 'temperature', kind: 'HIGH', value, limit: t.hard_max_c, level: 'HARD', unit: 'C' });
    } else if (typeof t.crit_high_c === 'number' && value > t.crit_high_c) {
      violations.push({ metric: 'temperature', kind: 'HIGH', value, limit: t.crit_high_c, level: 'CRIT', unit: 'C' });
    } else if (typeof t.warn_high_c === 'number' && value > t.warn_high_c) {
      violations.push({ metric: 'temperature', kind: 'HIGH', value, limit: t.warn_high_c, level: 'WARN', unit: 'C' });
    }

    return violations;
  }

  private async createOrUpdateAlarm(
    machineId: string,
    violation: ThresholdViolation,
    reading: { ts: string; seq?: number },
  ): Promise<void> {
    const { metric, kind, value, limit, level, unit } = violation;

    const dedupeKey = `threshold:${metric}:${level}:${kind}`;

    const severity: AlarmSeverity =
      level === 'HARD' || level === 'CRIT'
        ? AlarmSeverity.CRIT
        : level === 'WARN'
          ? AlarmSeverity.WARN
          : AlarmSeverity.INFO;

    const comparator = kind === 'HIGH' ? '>' : '<';
    const title = `${this.getMetricName(metric, kind)}: ${value}${unit} ${comparator} ${level.toLowerCase()}(${limit}${unit})`;

    const details: AlarmDetails = {
      metric,
      kind,
      value,
      limit,
      level,
      unit,
      reading: { ts: reading.ts, seq: reading.seq },
    };

    await this.alarmsService.createOrUpdateThresholdAlarm(
      machineId,
      dedupeKey,
      severity,
      title,
      details, // ✅ agora é um tipo real (não “never”)
    );
  }

  private getMetricName(metric: Metric, kind?: Kind): string {
    switch (metric) {
      case 'voltage':
        return kind === 'HIGH' ? 'Overvoltage' : 'Undervoltage';
      case 'current':
        return 'Overcurrent';
      case 'temperature':
        return 'Overtemperature';
      default:
        return metric;
    }
  }
}
