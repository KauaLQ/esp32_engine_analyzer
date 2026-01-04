// Machine types

// Machine status
export type MachineStatus = 'operante' | 'inoperante' | 'manutencao';

// Machine meta data
export interface MachineMeta {
  tag?: string;
  powerKw?: number;
  voltageNominal?: number;
  notes?: string;
  [key: string]: any;
}

// Machine device
export interface MachineDevice {
  id: string;
  deviceId: string;
  fwVersion: string;
  lastSeenAt: string;
  pairedAt: string;
}

// Machine latest reading
export interface MachineLatestReading {
  voltageV: number;
  currentA: number;
  temperatureC: number;
  seq: number;
}

// Machine base
export interface MachineBase {
  id: string;
  machineKey: string;
  patioId: string;
  manufacturer: string;
  model: string;
  status: MachineStatus;
  operatorUserId: string;
  meta: MachineMeta;
  createdAt: string;
  updatedAt: string;
  lastSeenAt?: string;
}

// Machine list item
export type MachineListItem = MachineBase;

// Machine detail
export interface MachineDetail extends MachineBase {
  device?: MachineDevice;
  latestReading?: MachineLatestReading;
}

// Machine update request
export interface MachineUpdateRequest {
  status?: MachineStatus;
  operatorUserId?: string;
  manufacturer?: string;
  model?: string;
  patioId?: string;
  meta?: MachineMeta;
}

// Pagination meta
export interface PaginationMeta {
  total: number;
  limit: number;
  hasMore: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Machine list response
export type MachineListResponse = PaginatedResponse<MachineListItem>;

// Machine query params
export interface MachineQueryParams {
  search?: string;
  status?: MachineStatus;
  patioId?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  orderBy?: 'createdAt' | 'updatedAt';
}
