import { Injectable, Logger } from '@nestjs/common';
import { EmissionsRepository } from '../repositories/emissions.repository';
import { ThresholdsRepository } from '../../thresholds/repositories/thresholds.repository';
import { getEmissionInputsFromProfile } from './types/threshold-profile.types';
import { BucketInterval, EmissionMetric, EmissionsQueryDto, EmissionsSeriesQueryDto } from './dto/emissions-query.dto';
import { EmissionsSeriesResponseDto, EmissionsSummaryResponseDto } from './dto/emissions-response.dto';

interface TelemetryReading {
  id: string | number;
  machineId: string;
  ts: string;
  voltageV?: number;
  currentA?: number;
  payload?: any;
}

@Injectable()
export class EmissionsService {
  private readonly logger = new Logger(EmissionsService.name);

  constructor(
    private readonly emissionsRepository: EmissionsRepository,
    private readonly thresholdsRepository: ThresholdsRepository,
  ) {}

  async computeAndPersist(machineId: string, telemetryReadingId: string | number): Promise<void> {
    try {
      // Get the current telemetry reading
      const currentReading = await this.emissionsRepository.findTelemetryReadingById(telemetryReadingId);
      if (!currentReading) {
        this.logger.warn(`Telemetry reading ${telemetryReadingId} not found`);
        return;
      }

      // Get the previous telemetry reading for the same machine
      const previousReading = await this.emissionsRepository.findPreviousTelemetryReading(
        machineId, 
        currentReading.ts
      );

      // Get active threshold profile for the machine
      const profile = await this.thresholdsRepository.findActiveProfile(machineId);
      
      // Extract emission inputs from profile with safe defaults
      const { fp, vrmsNom, irmsNom } = getEmissionInputsFromProfile(profile?.payload || {});

      // Get emission factor for the machine
      const emissionFactor = await this.emissionsRepository.findEmissionFactor(machineId);
      
      // Initialize computed values
      const computed: any = {
        ts_server: currentReading.ts,
        fp_used: fp,
      };

      // Calculate power (kW)
      const voltageV = currentReading.voltageV ?? vrmsNom;
      const currentA = currentReading.currentA ?? irmsNom;
      
      computed.vrms_used = voltageV;
      computed.irms_used = currentA;
      
      // If we don't have current, we can't calculate power
      if (currentA === null || currentA === undefined) {
        this.logger.warn(`No current value available for telemetry reading ${telemetryReadingId}`);
        computed.flags = ['NO_CURRENT_AVAILABLE'];
        await this.emissionsRepository.updateTelemetryReadingPayload(telemetryReadingId, computed);
        return;
      }

      // Calculate power: P = √3 * V * I * fp / 1000 (for three-phase)
      const powerKw = Math.sqrt(3) * voltageV * currentA * fp / 1000;
      computed.power_kw = powerKw;

      // Calculate energy increment if we have a previous reading
      if (previousReading) {
        const currentTs = new Date(currentReading.ts).getTime();
        const previousTs = new Date(previousReading.ts).getTime();
        const deltaHours = (currentTs - previousTs) / 3600000; // ms to hours
        
        // Skip energy calculation if delta is too large or negative
        if (deltaHours <= 0 || deltaHours > 2) {
          computed.flags = computed.flags || [];
          computed.flags.push(deltaHours <= 0 ? 'NEGATIVE_TIME_DELTA' : 'LARGE_TIME_DELTA');
          computed.delta_hours = deltaHours;
        } else {
          computed.delta_hours = deltaHours;
          
          // Energy (kWh) = Power (kW) * Time (h)
          const energyKwhIncrement = powerKw * deltaHours;
          computed.energy_kwh_increment = energyKwhIncrement;
          
          // Calculate emissions if we have an emission factor
          if (emissionFactor) {
            const factorValue = Number(emissionFactor.factor_kgco2_per_kwh.toString());
            computed.emission_factor_used = factorValue;
            computed.kgco2e_increment = energyKwhIncrement * factorValue;
          } else {
            computed.emission_factor_used = 0.0;
            computed.kgco2e_increment = 0.0;
            computed.flags = computed.flags || [];
            computed.flags.push('NO_FACTOR_CONFIGURED');
          }
        }
      } else {
        computed.flags = computed.flags || [];
        computed.flags.push('NO_PREVIOUS_READING');
      }

      // Update the telemetry reading with computed values
      await this.emissionsRepository.updateTelemetryReadingPayload(telemetryReadingId, computed);
    } catch (error) {
      this.logger.error(`Error computing emissions for machine ${machineId}: ${error.message}`);
    }
  }

  async getSummary(machineId: string, query: EmissionsQueryDto): Promise<EmissionsSummaryResponseDto> {
    const { from, to } = this.getDefaultTimeRange(query);
    
    const summary = await this.emissionsRepository.getSummary(machineId, from, to);
    
    return {
      machineId,
      from,
      to,
      energyKwhTotal: summary.energyKwhTotal,
      kgco2eTotal: summary.kgco2eTotal,
      factorUsed: summary.factorUsed,
      pointsCount: summary.pointsCount,
    };
  }

  async getSeries(
    machineId: string, 
    query: EmissionsSeriesQueryDto
  ): Promise<EmissionsSeriesResponseDto> {
    const { from, to } = this.getDefaultTimeRange(query);
    const metric = query.metric ?? EmissionMetric.KGCO2E;
    const bucket: BucketInterval = query.bucket ?? ('1h' as BucketInterval);

    const series = await this.emissionsRepository.getSeries(machineId, from, to, bucket, metric);
    
    return {
      machineId,
      metric,
      bucket,
      from,
      to,
      points: series.points,
    };
  }

  private getDefaultTimeRange(query: EmissionsQueryDto): { from: string; to: string } {
    const to = query.to || new Date().toISOString();
    
    // Default to 24 hours before 'to' if 'from' is not provided
    const toDate = new Date(to);
    const fromDate = query.from 
      ? new Date(query.from) 
      : new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }
}
