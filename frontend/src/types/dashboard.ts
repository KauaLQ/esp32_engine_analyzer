// Dashboard metrics types

export interface DashboardMetricsParams {
  from: string;
  to: string;
}

export interface DashboardMetricsResponse {
  globalStats: {
    machinesTotal: number;
    patiosTotal: number;
    alarms: {
      byStatus: { 
        open: number; 
        ack: number; 
        closed: number 
      };
      bySeverity: { 
        info: number; 
        warn: number; 
        crit: number 
      };
      openBySeverity: { 
        info: number; 
        warn: number; 
        crit: number 
      };
    };
  };
  averages: {
    avgVoltageV: number | null;
    avgCurrentA: number | null;
    avgTemperatureC: number | null;
    avgPowerKw: number | null;
    avgEnergyKwh: number | null;
    avgKgco2e: number | null;
  };
}
