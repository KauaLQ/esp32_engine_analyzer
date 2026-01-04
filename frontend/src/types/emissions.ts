// Emissions types

// Emissions summary
export interface EmissionsSummary {
  machineId: string;
  from: string;
  to: string;
  energyKwhTotal: number;
  kgco2eTotal: number;
  factorUsed: number;
  pointsCount: number;
}

// Emissions series point
export interface EmissionsSeriesPoint {
  ts: string;
  value: number;
}

// Emissions series
export interface EmissionsSeries {
  machineId: string;
  metric: 'power_kw' | 'energy_kwh' | 'kgco2e';
  bucket: '5m' | '15m' | '1h' | '1d';
  from: string;
  to: string;
  points: EmissionsSeriesPoint[];
}

// Emissions summary query params
export interface EmissionsSummaryQueryParams {
  from: string;
  to: string;
}

// Emissions series query params
export interface EmissionsSeriesQueryParams {
  from: string;
  to: string;
  bucket?: '5m' | '15m' | '1h' | '1d';
  metric?: 'power_kw' | 'energy_kwh' | 'kgco2e';
}
