export declare class DashboardMetricsQueryDto {
    from?: string;
    to?: string;
}
export declare class AlarmsByStatusDto {
    open: number;
    ack: number;
    closed: number;
}
export declare class AlarmsBySeverityDto {
    info: number;
    warn: number;
    crit: number;
}
export declare class OpenAlarmsBySeverityDto {
    info: number;
    warn: number;
    crit: number;
}
export declare class AlarmsDto {
    byStatus: AlarmsByStatusDto;
    bySeverity: AlarmsBySeverityDto;
    openBySeverity: OpenAlarmsBySeverityDto;
}
export declare class GlobalStatsDto {
    machinesTotal: number;
    patiosTotal: number;
    alarms: AlarmsDto;
}
export declare class AveragesDto {
    avgVoltageV: number | null;
    avgCurrentA: number | null;
    avgTemperatureC: number | null;
    avgPowerKw: number | null;
    avgEnergyKwh: number | null;
    avgKgco2e: number | null;
}
export declare class DashboardMetricsResponseDto {
    globalStats: GlobalStatsDto;
    averages: AveragesDto;
}
