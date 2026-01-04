import { Injectable } from '@nestjs/common';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { 
  DashboardMetricsResponseDto, 
  AlarmsByStatusDto, 
  AlarmsBySeverityDto, 
  OpenAlarmsBySeverityDto,
  AlarmsDto,
  GlobalStatsDto,
  AveragesDto
} from './dto/dashboard-metrics.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardMetrics(
    from?: string,
    to?: string,
  ): Promise<DashboardMetricsResponseDto> {
    // Set default time range if not provided (last 30 days)
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from 
      ? new Date(from) 
      : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts for global stats section
    const [
      machinesTotal,
      patiosTotal,
      alarmsByStatus,
      alarmsBySeverity,
      openAlarmsBySeverity,
      averages,
    ] = await Promise.all([
      this.dashboardRepository.countMachines(),
      this.dashboardRepository.countPatios(),
      this.dashboardRepository.countAlarmsByStatus(fromDate, toDate),
      this.dashboardRepository.countAlarmsBySeverity(fromDate, toDate),
      this.dashboardRepository.countOpenAlarmsBySeverity(fromDate, toDate),
      this.dashboardRepository.getAverageTelemetryValues(fromDate, toDate),
    ]);

    // Format alarms by status
    const byStatus: AlarmsByStatusDto = {
      open: 0,
      ack: 0,
      closed: 0,
    };

    alarmsByStatus.forEach(item => {
      byStatus[item.status as keyof AlarmsByStatusDto] = item.count;
    });

    // Format alarms by severity
    const bySeverity: AlarmsBySeverityDto = {
      info: 0,
      warn: 0,
      crit: 0,
    };

    alarmsBySeverity.forEach(item => {
      bySeverity[item.severity as keyof AlarmsBySeverityDto] = item.count;
    });

    // Format open alarms by severity
    const openBySeverity: OpenAlarmsBySeverityDto = {
      info: 0,
      warn: 0,
      crit: 0,
    };

    openAlarmsBySeverity.forEach(item => {
      openBySeverity[item.severity as keyof OpenAlarmsBySeverityDto] = item.count;
    });

    // Build the response
    return {
      globalStats: {
        machinesTotal,
        patiosTotal,
        alarms: {
          byStatus,
          bySeverity,
          openBySeverity,
        },
      },
      averages: {
        avgVoltageV: averages.avgVoltageV,
        avgCurrentA: averages.avgCurrentA,
        avgTemperatureC: averages.avgTemperatureC,
        avgPowerKw: averages.avgPowerKw,
        avgEnergyKwh: averages.avgEnergyKwh,
        avgKgco2e: averages.avgKgco2e,
      },
    };
  }
}
